<?php
require_once 'auth-helper.php';
require_once 'utils.php';

$userId = authenticate();
if (!$userId) { http_response_code(401); echo json_encode(['error'=>'Unauthorized']); exit; }

$method = $_SERVER['REQUEST_METHOD'];
$table = 'health_records';

// GET
if ($method === 'GET') {
    if (isset($_GET['admin'])) {
        requireAdmin($userId);
        $stmt = $pdo->prepare("
            SELECT hr.*, p.name as petName, u.first_name, u.last_name 
            FROM health_records hr 
            JOIN pets p ON hr.pet_id = p.id 
            JOIN users u ON hr.owner_id = u.id
            ORDER BY hr.visit_date DESC
        ");
        $stmt->execute();
    } else {
        $stmt = $pdo->prepare("
            SELECT hr.*, p.name as petName 
            FROM health_records hr 
            JOIN pets p ON hr.pet_id = p.id 
            WHERE hr.owner_id = ?
            ORDER BY hr.visit_date DESC
        ");
        $stmt->execute([$userId]);
    }
    echo json_encode($stmt->fetchAll());
    exit;
}

// POST
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $data['owner_id'] = $userId;

    $required = ['pet_id', 'visit_date', 'visit_reason'];
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

// PUT
if ($method === 'PUT') {
    parse_str(file_get_contents('php://input'), $data);
    $id = $data['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(['error'=>'ID required']); exit; }

    unset($data['id']);
    $sets = [];
    foreach ($data as $k => $v) $sets[] = "$k = :$k";
    $sql = "UPDATE $table SET " . implode(', ', $sets) . " WHERE id = :id AND owner_id = :owner_id";
    $data['id'] = $id;
    $data['owner_id'] = $userId;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($data);
    echo json_encode(['success' => true]);
    exit;
}

// DELETE
if ($method === 'DELETE') {
    parse_str(file_get_contents('php://input'), $data);
    $id = $data['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(['error'=>'ID required']); exit; }

    $stmt = $pdo->prepare("DELETE FROM $table WHERE id = ? AND owner_id = ?");
    $stmt->execute([$id, $userId]);
    echo json_encode(['success' => true]);
    exit;
}