<?php
require 'config.php';
require 'utils.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // ---------- LOGIN ----------
    if ($data['action'] === 'login') {
        $email = $data['email'];
        $password = $data['password'];
        $type = $data['type'];   // 'admin' or 'client'

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND user_type = ?");
        $stmt->execute([$email, $type]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && verifyPassword($password, $user['password_hash'])) {
            $token = bin2hex(random_bytes(32));
            $stmt = $pdo->prepare("INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY))");
            $stmt->execute([$user['id'], $token]);

            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'firstName' => $user['first_name'],
                    'lastName' => $user['last_name'],
                    'type' => $user['user_type']
                ],
                'token' => $token
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        }
    }

    // ---------- REGISTER ----------
    if ($data['action'] === 'register') {
        $first = $data['firstName'];
        $last  = $data['lastName'];
        $email = $data['email'];
        $phone = $data['phone'];
        $addr  = $data['address'];
        $pass  = hashPassword($data['password']);

        $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, user_type, first_name, last_name, phone, address) VALUES (?, ?, 'client', ?, ?, ?, ?)");
        $stmt->execute([$email, $pass, $first, $last, $phone, $addr]);

        echo json_encode(['success' => true, 'message' => 'Account created']);
    }
}