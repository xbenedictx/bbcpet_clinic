<?php
require_once 'auth-helper.php';
require_once 'utils.php';

$userId = authenticate();
if (!$userId) { http_response_code(401); echo json_encode(['error'=>'Unauthorized']); exit; }

$method = $_SERVER['REQUEST_METHOD'];
$table = 'invoices';

// GET
if ($method === 'GET') {
    if (isset($_GET['admin'])) {
        requireAdmin($userId);
        $stmt = $pdo->prepare("
            SELECT i.*, p.name as petName, u.first_name, u.last_name 
            FROM invoices i 
            JOIN pets p ON i.pet_id = p.id 
            JOIN users u ON i.client_id = u.id
            ORDER BY i.invoice_date DESC
        ");
        $stmt->execute();
    } else {
        $stmt = $pdo->prepare("
            SELECT i.*, p.name as petName 
            FROM invoices i 
            JOIN pets p ON i.pet_id = p.id 
            WHERE i.client_id = ?
            ORDER BY i.invoice_date DESC
        ");
        $stmt->execute([$userId]);
    }
    echo json_encode($stmt->fetchAll());
    exit;
}

// POST: Create invoice (admin only)
if ($method === 'POST') {
    requireAdmin($userId);
    $data = json_decode(file_get_contents('php://input'), true);

    $required = ['client_id', 'pet_id', 'invoice_date', 'services'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Field '$field' is required"]);
            exit;
        }
    }

    // Calculate totals
    $subtotal = 0;
    foreach ($data['services'] as $s) {
        $subtotal += $s['quantity'] * $s['price'];
    }
    $data['subtotal'] = $subtotal;
    $data['total_amount'] = $subtotal;
    $data['balance_due'] = $subtotal;
    $data['status'] = 'pending';
    $data['invoice_number'] = 'BBC-' . date('Y') . '-' . str_pad($pdo->query("SELECT COUNT(*)+1 FROM invoices WHERE YEAR(invoice_date)=YEAR(CURDATE())")->fetchColumn(), 4, '0', STR_PAD_LEFT);

    $cols = ['client_id','pet_id','invoice_date','invoice_number','subtotal','total_amount','balance_due','status','services'];
    $placeholders = array_map(fn($c)=>":$c", $cols);
    $sql = "INSERT INTO $table (" . implode(',', $cols) . ") VALUES (" . implode(',', $placeholders) . ")";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'client_id' => $data['client_id'],
        'pet_id' => $data['pet_id'],
        'invoice_date' => $data['invoice_date'],
        'invoice_number' => $data['invoice_number'],
        'subtotal' => $data['subtotal'],
        'total_amount' => $data['total_amount'],
        'balance_due' => $data['balance_due'],
        'status' => $data['status'],
        'services' => json_encode($data['services'])
    ]);

    echo json_encode(['id' => $pdo->lastInsertId(), 'success' => true]);
    exit;
}

// PUT: Update status (e.g., mark paid)
if ($method === 'PUT') {
    parse_str(file_get_contents('php://input'), $data);
    $id = $data['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(['error'=>'ID required']); exit; }

    $allowed = ['status', 'amount_paid'];
    $sets = [];
    foreach ($data as $k => $v) {
        if (in_array($k, $allowed)) $sets[] = "$k = :$k";
    }
    if (empty($sets)) { echo json_encode(['success'=>false]); exit; }

    $sql = "UPDATE $table SET " . implode(', ', $sets) . ", balance_due = total_amount - :amount_paid WHERE id = :id";
    if ($data['status'] ?? '' === 'paid') {
        $data['amount_paid'] = $data['amount_paid'] ?? $pdo->query("SELECT total_amount FROM invoices WHERE id=$id")->fetchColumn();
    }
    $data['id'] = $id;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($data);
    echo json_encode(['success' => true]);
    exit;
}