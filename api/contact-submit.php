<?php
declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit('Method Not Allowed'); }

// Basic bot trap
if (!empty($_POST['website'] ?? '')) { header('Location: /thank-you.html', true, 303); exit; }

// CSRF (double-submit cookie)
$cookie = $_COOKIE['csrf'] ?? '';
$posted = $_POST['csrf'] ?? '';
if (!$cookie || !$posted || !hash_equals($cookie, $posted)) {
  http_response_code(400); exit('Invalid CSRF');
}

function field(string $k): string { return trim((string)($_POST[$k] ?? '')); }

$name        = field('name');
$email       = field('email');
$phone       = field('phone');
$org         = field('organization');
$state       = field('state');
$facility    = field('facility');
$projectType = field('projectType');
$timeline    = field('timeline');
$message     = field('message');

if ($name === '' || $email === '' || $projectType === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400); exit('Please fill in required fields with a valid email.');
}

$to = 'texassportslighting@gmail.com'; // <-- change this
$subject = "New Quote Request — $name";
$text = "Name: $name\nEmail: $email\nPhone: $phone\nOrganization: $org\nState: $state\nFacility: $facility\nProject: $projectType\nTimeline: $timeline\n\nMessage:\n$message\n\nIP: ".($_SERVER['REMOTE_ADDR'] ?? 'N/A');

$apiKey = getenv('RESEND_API_KEY'); // set in Vercel Project → Settings → Environment Variables
if (!$apiKey) { http_response_code(500); exit('Email API key missing'); }

// Send via Resend REST API
$payload = json_encode([
  'from' => 'Texas Sports Lighting <noreply@contact.cxgraphics.me>',
  'to' => [$to],
  'subject' => $subject,
  'text' => $text
], JSON_UNESCAPED_SLASHES);

$ch = curl_init('https://api.resend.com/emails');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
  ],
  CURLOPT_POSTFIELDS => $payload
]);
$res = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($code >= 200 && $code < 300) { header('Location: /thank-you.html', true, 303); exit; }
http_response_code(500); echo 'Email send failed';
