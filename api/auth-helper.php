<?php
// api/auth-helper.php
require_once 'config.php';

function authenticate() {
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    if (!$token) return false;

    global $pdo;
    $stmt = $pdo->prepare("SELECT user_id FROM auth_tokens WHERE token = ? AND expires_at > NOW()");
    $stmt->execute([$token]);
    return $stmt->fetchColumn(); // user_id or false
}

function requireAdmin($userId) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT user_type FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $type = $stmt->fetchColumn();
    if ($type !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Admin access required']);
        exit;
    }

    
}
function isAdmin($userId) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT user_type FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    return $stmt->fetchColumn() === 'admin';
}