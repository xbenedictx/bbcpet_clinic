<?php
require 'config.php';
echo json_encode(['status' => 'MySQL connected!', 'tables' => $pdo->query("SHOW TABLES")->fetchAll()]);