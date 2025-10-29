<?php
require_once 'auth-helper.php';
require_once 'utils.php';

$userId = authenticate();
if (!$userId) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$table = 'appointments';

$isAdmin = isAdmin($userId);

if ($method === 'GET') {
    if (isset($_GET['admin'])) {
        requireAdmin($userId);
        $stmt = $pdo->prepare("
            SELECT a.*, p.name as petName, u.first_name, u.last_name 
            FROM appointments a 
            JOIN pets p ON a.pet_id = p.id 
            JOIN users u ON a.owner_id = u.id
        ");
        $stmt->execute();
    } else {
        $stmt = $pdo->prepare("
            SELECT a.*, p.name as petName 
            FROM appointments a 
            JOIN pets p ON a.pet_id = p.id 
            WHERE a.owner_id = ?
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        ");
        $stmt->execute([$userId]);
    }
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['owner_id']) && $data['owner_id'] != $userId) {
        if (!$isAdmin) {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required to create for other owners']);
            exit;
        }
    } else {
        $data['owner_id'] = $userId;
    }
    $data['appointment_uuid'] = uuid();

    $required = ['pet_id', 'appointment_date', 'appointment_time', 'reason_for_visit'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Field '$field' is required"]);
            exit;
        }
    }

    $cols = array_keys($data);
    $placeholders = array_map(fn($c) => ":$c", $cols);
    $sql = "INSERT INTO $table (" . implode(',', $cols) . ") VALUES (" . implode(',', $placeholders) . ")";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($data);
    echo json_encode(['id' => $pdo->lastInsertId(), 'success' => true]);
    exit;
}

if ($method === 'PUT') {
    parse_str(file_get_contents('php://input'), $data);
    $id = $data['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID required']);
        exit;
    }

    unset($data['id']);
    $sets = [];
    foreach ($data as $k => $v) $sets[] = "$k = :$k";
    $sql = "UPDATE $table SET " . implode(', ', $sets) . " WHERE id = :id" . ($isAdmin ? "" : " AND owner_id = :owner_id");
    $data['id'] = $id;
    if (!$isAdmin) $data['owner_id'] = $userId;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($data);
    echo json_encode(['success' => true]);
    exit;
}

if ($method === 'DELETE') {
    parse_str(file_get_contents('php://input'), $data);
    $id = $data['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID required']);
        exit;
    }

    $sql = "UPDATE $table SET status = 'cancelled' WHERE id = ?" . ($isAdmin ? "" : " AND owner_id = ?");
    $params = $isAdmin ? [$id] : [$id, $userId];
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true]);
    exit;
}