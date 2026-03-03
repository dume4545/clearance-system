<?php
// ── helpers.php — response helper functions ───────────────────────────────────

if (!function_exists('jsonSuccess')) {
    function jsonSuccess($data = [], $message = 'Success', $code = 200) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        $response = ['success' => true, 'message' => $message];
        if (is_array($data) && !empty($data)) {
            $response = array_merge($response, $data);
        }
        echo json_encode($response);
        exit;
    }
}

if (!function_exists('jsonError')) {
    function jsonError($message = 'An error occurred', $code = 400) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'message' => $message]);
        exit;
    }
}

if (!function_exists('jsonResponse')) {
    function jsonResponse($success, $message = '', $data = [], $code = 200) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        $response = ['success' => (bool)$success, 'message' => $message];
        if (!empty($data)) $response = array_merge($response, (array)$data);
        echo json_encode($response);
        exit;
    }
}

if (!function_exists('sendJson')) {
    function sendJson($data, $code = 200) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data);
        exit;
    }
}

if (!function_exists('getRequestBody')) {
    function getRequestBody() {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
}
