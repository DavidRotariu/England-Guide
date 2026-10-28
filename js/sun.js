/* Sunrise / sunset for a given date and place (NOAA solar calculator algorithm).
   Works offline; accurate to about a minute for London. */
(function () {
  const rad = Math.PI / 180;

  // Returns { sunrise: Date, sunset: Date } (absolute instants) for the civil date y-m-d.
  function sunTimes(y, m, d, lat, lng) {
    // Julian day at 12:00 UTC of the date
    const jd = Date.UTC(y, m - 1, d, 12) / 86400000 + 2440587.5;
    const t = (jd - 2451545.0) / 36525;

    const L0 = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
    const M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
    const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
    const C = Math.sin(M * rad) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
      Math.sin(2 * M * rad) * (0.019993 - 0.000101 * t) +
      Math.sin(3 * M * rad) * 0.000289;
    const trueLong = L0 + C;
    const omega = 125.04 - 1934.136 * t;
    const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * rad);
    const eps0 = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
    const eps = eps0 + 0.00256 * Math.cos(omega * rad);
    const decl = Math.asin(Math.sin(eps * rad) * Math.sin(lambda * rad));

    const yv = Math.tan((eps / 2) * rad) ** 2;
    const eqTime = 4 / rad * (yv * Math.sin(2 * L0 * rad) - 2 * e * Math.sin(M * rad) +
      4 * e * yv * Math.sin(M * rad) * Math.cos(2 * L0 * rad) -
      0.5 * yv * yv * Math.sin(4 * L0 * rad) - 1.25 * e * e * Math.sin(2 * M * rad)); // minutes

    const cosH = (Math.cos(90.833 * rad) - Math.sin(lat * rad) * Math.sin(decl)) /
      (Math.cos(lat * rad) * Math.cos(decl));
    const H = Math.acos(Math.max(-1, Math.min(1, cosH))) / rad; // degrees

    const noonMin = 720 - 4 * lng - eqTime; // minutes after 00:00 UTC
    const base = Date.UTC(y, m - 1, d);
    return {
      sunrise: new Date(base + (noonMin - 4 * H) * 60000),
      sunset: new Date(base + (noonMin + 4 * H) * 60000),
    };
  }

  window.SunCalc = { sunTimes };
})();
