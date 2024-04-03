<?php
$link = file_get_contents('php://input');//読み込み&jsonにして出力
$content = file_get_contents($link);
echo json_encode($content);
?>