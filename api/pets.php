<?php
require 'config.php';
require 'utils.php';

function auth() {
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    global $pdo;
    $stmt = $pdo->prepare("SELECT user_id FROM auth_tokens WHERE token = ? AND expires_at > NOW()");
    $stmt->execute([$token]);
    return $stmt->fetchColumn();   // returns user_id or false
}

$userId = auth();
if (!$userId) { http_response_code(401); echo json_encode(['error'=>'Unauthorized']); exit; }

$method = $_SERVER['REQUEST_METHOD'];

// ---------- GET ALL (admin) OR USER'S PETS ----------
if ($method === 'GET') {
    if ($_GET['admin'] ?? false) {
        $stmt = $pdo->prepare("SELECT p.*, u.first_name, u.last_name FROM pets p JOIN users u ON p.owner_id = u.id");
        $stmt->execute();
    } else {
        $stmt = $pdo->prepare("SELECT * FROM pets WHERE owner_id = ?");
        $stmt->execute([$userId]);
    }
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

// ---------- CREATE ----------
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $data['owner_id'] = $userId;
    $data['pet_uuid'] = uuid();

    $cols = array_keys($data);
    $placeholders = array_map(fn($c)=>":$c", $cols);
    $sql = "INSERT INTO pets (".implode(',',$cols).") VALUES (".implode(',',$placeholders).")";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($data);
    echo json_encode(['id'=>$pdo->lastInsertId()]);
}

// ---------- UPDATE ----------
if ($method === 'PUT') {
    parse_str(file_get_contents('php://input'), $data);
    $id = $data['id'];
    unset($data['id']);

    $sets = [];
    foreach ($data as $k=>$v) $sets[] = "$k=:$k";
    $sql = "UPDATE pets SET ".implode(', ',$sets)." WHERE id=:id AND owner_id=:owner_id";
    $data['id'] = $id;
    $data['owner_id'] = $userId;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($data);
    echo json_encode(['success'=>true]);
}

// ---------- DELETE ----------
if ($method === 'DELETE') {
    parse_str(file_get_contents('php://input'), $data);
    $stmt = $pdo->prepare("DELETE FROM pets WHERE id=? AND owner_id=?");
    $stmt->execute([$data['id'], $userId]);
    echo json_encode(['success'=>true]);
}