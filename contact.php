<?php
// contact.php
declare(strict_types=1);
session_start();
$_SESSION['csrf'] = bin2hex(random_bytes(32));
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Contact / Quote • Texas Sports Lighting</title>
  <meta name="description" content="Texas Sports Lighting — LED sports lighting for every venue." />
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/styles.css" />
  <script defer src="assets/js/main.js"></script>
</head>
<body>
<header class="site-header"> … (same header/nav markup you already have) … </header>
<main>
<section class="section">
  <div class="container grid split">
    <div>
      <span class="kicker">Contact</span>
      <h1 class="title">Request a Quote</h1>
      <p class="lead">Tell us about your project. We'll follow up with next steps and a tailored plan.</p>
    </div>
    <div class="card">
      <form class="form" data-validate action="contact-submit.php" method="POST" accept-charset="UTF-8">
        <!-- CSRF -->
        <input type="hidden" name="csrf" value="<?= htmlspecialchars($_SESSION['csrf'], ENT_QUOTES) ?>"/>
        <!-- Honeypot (should be empty) -->
        <input type="text" name="website" autocomplete="off" tabindex="-1" style="position:absolute; left:-5000px; height:0; width:0; opacity:0;" aria-hidden="true">

        <div class="row">
          <input class="input" name="name" placeholder="Full name *" required>
          <input class="input" type="email" name="email" placeholder="Email *" required>
        </div>
        <div class="row">
          <input class="input" name="phone" placeholder="Phone">
          <input class="input" name="organization" placeholder="Organization">
        </div>
        <div class="row">
          <select class="input" name="state">
            <option value="">State</option>
            <!-- (states list unchanged) -->
            <option>MI</option><option>OH</option><option>IN</option><!-- etc -->
          </select>
          <select class="input" name="facility">
            <option value="">Facility</option>
            <option>Tennis</option><option>Football</option><option>Indoor Arena</option><option>Aquatic</option><option>Sports Complex</option>
          </select>
        </div>
        <div class="row">
          <select class="input" name="projectType" required>
            <option value="">Project type *</option>
            <option>Retrofit</option><option>New Build</option>
          </select>
          <select class="input" name="timeline">
            <option value="">Timeline</option>
            <option>0–3 months</option><option>3–6 months</option><option>6–12 months</option><option>12+ months</option>
          </select>
        </div>
        <textarea class="input" name="message" rows="5" placeholder="Describe your facility, goals, and any constraints..."></textarea>
        <button class="btn btn-cta" type="submit">Submit</button>
      </form>
    </div>
  </div>
</section>
</main>
<footer class="site-footer"> … (same footer) … </footer>
</body>
</html>
