<?php
require_once 'auth-helper.php';

$userId = authenticate();
if (!$userId) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if (!isAdmin($userId)) {
    http_response_code(403);
    echo json_encode(['error' => 'Admin access required']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("
        SELECT id, CONCAT(first_name, ' ', last_name) AS name, email, phone, address 
        FROM users 
        WHERE user_type = 'client' 
        ORDER BY last_name ASC
    ");
    $stmt->execute();
    echo json_encode($stmt->fetchAll());
    exit;
}