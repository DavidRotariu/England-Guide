/* =============================================================================
   LONDON, DECEMBER 2026 — all itinerary & guide content lives in this file.
   Edit freely; the UI reads everything from window.TRIP. After editing, bump
   CACHE_VERSION in sw.js so phones pick up the new content.

   SCHEMA (quick reference — see README for the long version)
   ---------------------------------------------------------------------------
   settings.day1Date   "YYYY-MM-DD" — Day 1's date. Day N = day1Date + (N-1).
   flight              Day 5 departure placeholder — fill in airport/flight/time.
   days[]              { title, neighbourhoods[], nutshell, alerts[], items[] }
   items[]             a stop or a travel leg, in itinerary order:
     type              "sight" | "food" | "walk" | "flight" | "travel"
     id                unique slug (used in the URL and for checklist ticks)
     time / endTime    "HH:MM" as planned (your original times are kept)
     when              free-text time if there's no clock time ("Evening")
     suggestedTime / suggestedEnd / suggestedWhy   adjusted timing where a clash exists
     name, area, teaser
     myNotes[]         your own notes → shown in the "Note to self" box
     light             "day" = best before dark (flagged against sunset) | "night" = lovely after dark
     free              true if entry is free
     book              { what, when, link, priority: "must"|"recommended"|"optional" } → booking checklist
     alerts[]          { level: "clash"|"minor", title, html } timing clashes / warnings
     checks[]          "Check before you go" items (strings)
     story[]           paragraphs (150–250 words total)
     facts[]           4–6 fun facts
     lookFor[]         2–3 things to spot on site
     practical         { hours, cost, booking, station, allow, address, extra }
     food              { knownFor, order, price, alternatives }  (food stops only)
     mapQuery          text for the "Open in Google Maps" link
     wiki              Wikipedia article title(s) whose lead photo illustrates the stop (first one with a photo wins)
     sources[]         { label, url }
   travel legs:        { type:"travel", mode, modeLabel, from, to, detail, time }
   ========================================================================== */

window.TRIP = {
  title: "London, December 2026",
  brand: "London ’26",
  dates: "4–8 December",
  subtitle: "The Christmas Line",
  tagline: "palaces, river, markets and stories",

  settings: {
    day1Date: "2026-12-04",          // ← change this one value to shift every day (Day 1 = Fri 4 Dec: you land at Luton 06:55)
    timezone: "Europe/London",
    lat: 51.5074, lng: -0.1278,      // used for sunrise/sunset
  },

  base: { name: "Mill Hill (north London, Zone 4)", note: "Usually leaving around 08:00. Nearest stations: Mill Hill Broadway (Thameslink) and Mill Hill East (Northern line)." },

  flight: {
    airport: "London Luton (LTN)",
    flightNumber: "W4 3648 (Wizz Air), LTN → Suceava (SCV), lands 01:35 Wed 9 Dec",
    departs: "Tue 8 Dec, 20:25",
    beAtAirport: "by about 18:25 (2 h before; online check-in, under-seat bags only)",
    outbound: "W4 3645, Suceava 05:40 → Luton 06:55, Fri 4 Dec",
    baggage: "Free under-seat bag only (40 × 30 × 20 cm) per person",
  },

  /* Extra items for the booking checklist that aren't tied to one stop */
  checklistExtra: [
    { id: "x-pamo", title: "Get Welcome Pamo Card", context: "Your transport note", when: "before the trip", priority: "must" },
    { id: "x-guard", title: "Check the Changing the Guard calendar for Fri 4 Dec", context: "Household Division publishes dates ~6 weeks ahead", when: "from early November", link: "https://www.householddivision.org.uk/changing-the-guard-calendar", priority: "must" },
    { id: "x-contactless", title: "Contactless card or phone wallet for every traveller (no foreign-fee card ideally)", context: "Transport", priority: "must" },
    { id: "x-studentid", title: "Pack student ID / ISIC for every traveller", context: "Student prices at the Tower, St Paul’s, Tower Bridge…", priority: "must" },
    { id: "x-checkin", title: "Wizz Air online check-in for both flights (boarding passes in the app)", context: "W4 3645 (4 Dec) & W4 3648 (8 Dec)", when: "check-in opens about 30 days before each flight", priority: "must" },
    { id: "x-stpauls-day4", title: "If you move St Paul’s to Day 4: book a sightseeing ticket for Mon 7 Dec ~13:30", context: "St Paul’s has no sightseeing on Sundays (Day 3)", when: "a few days ahead", link: "https://www.stpauls.co.uk/visit-us", priority: "recommended" },
    { id: "x-luggage", title: "Day 5: carry your under-seat bags all day, or allow time to collect them in Mill Hill on the way to Luton", context: "Departure day", priority: "recommended" },
  ],

  /* ------------------------------------------------------------------ TIPS */
  tips: [
    {
      title: "Your note: transport card",
      html: `<p class="note-inline"><strong>Note to self:</strong> Get Welcome Pamo Card.</p>
        <p>Whatever card you use, the cheapest way round London is to <strong>tap the same contactless card or phone</strong> on every Tube, bus, Overground, Elizabeth line and Thameslink journey inside London. TfL automatically caps what you pay each day.</p>`,
      checks: ["I couldn’t find a London transport card called “Welcome Pamo”. If it’s a prepaid or travel bank card, check that it does contactless (the “tap” symbol) and charges no foreign-transaction fees. If it does, it works at TfL gates just like any bank card."],
    },
    {
      title: "Contactless & Oyster: daily caps",
      html: `<p>Pay-as-you-go fares are <strong>capped per day</strong>. Once you hit the cap, further journeys that day are free. Mill Hill is in <strong>Zone 4</strong>, so most days you’ll hit the Zones 1–4 cap.</p>
        <table><thead><tr><th>Zones</th><th>Daily cap (adult)</th></tr></thead><tbody>
          <tr><td>1–2</td><td>£8.90</td></tr>
          <tr><td>1–4 (Mill Hill)</td><td>£12.80</td></tr>
          <tr><td>1–6</td><td>£16.30</td></tr>
          <tr><td>Bus &amp; tram only</td><td>£5.25 (single bus fare £1.75, unlimited transfers within an hour with the Hopper fare)</td></tr>
        </tbody></table>
        <ul>
          <li><strong>One card per person</strong>, and always the same one: caps only work per card or device. Keep your phone charged.</li>
          <li><strong>Touch in and out</strong> on Tube, rail and Thameslink, including the yellow readers at Mill Hill Broadway. On buses, touch in only.</li>
          <li><strong>Card clash:</strong> don’t hold your whole wallet to the reader. It may charge the wrong card.</li>
          <li>Thameslink between Mill Hill Broadway and central London counts towards the same TfL cap.</li>
          <li><strong>Not included in caps:</strong> Uber Boat (Thames Clippers) and the IFS Cloud Cable Car. You can still pay for both by tapping a card.</li>
          <li>A 16–25 Railcard linked to an Oyster gives a third off <em>off-peak</em> caps, but at about £35 it’s only worth it if you already have one.</li>
          <li>Student Oyster discounts are only for students at London institutions, so they don’t apply to visitors.</li>
        </ul>`,
      checks: ["2026 cap figures come from third-party fare guides quoting TfL (caps reported frozen into 2027). Confirm on tfl.gov.uk/fares before you go.",
               "Weekend engineering works often close Thameslink or Tube sections, especially on Day 1 (Sat) and Day 2 (Sun). Check TfL Go or National Rail the evening before."],
    },
    {
      title: "Getting into town from Mill Hill",
      html: `<ul>
        <li><strong>From Luton Airport (Day 1):</strong> take the Luton DART shuttle (about 4 min, charged separately) to Luton Airport Parkway, then Thameslink direct to Mill Hill Broadway (about 25 min). Contactless works at Luton Airport Parkway.</li>
        <li><strong>Thameslink</strong> from Mill Hill Broadway: about 20 min to St Pancras. Many trains continue through Farringdon, City Thameslink and Blackfriars to London Bridge, which is handy for Days 3 and 5.</li>
        <li><strong>Northern line</strong> from Mill Hill East (Edgware branch via Finchley Central). It’s slower, but useful if Thameslink is disrupted. You may need to change at Finchley Central.</li>
        <li>From King’s Cross St Pancras, the Victoria, Piccadilly, Northern, Circle and Hammersmith &amp; City lines take you almost anywhere.</li>
      </ul>`,
    },
    {
      title: "December in London",
      html: `<ul>
        <li><strong>Dark early:</strong> sunset is about 15:52 all week and sunrise about 07:50. Do views, parks and photos before 15:30. Lights, markets and theatre are better after dark.</li>
        <li><strong>Weather:</strong> typically 5–9 °C, damp and grey. Bring waterproof layers and comfortable waterproof shoes. You’ll walk 15–20 km some days.</li>
        <li><strong>Sunday trading:</strong> big shops open for only six hours on Sundays (often 11:30/12:00–18:00). This matters on Day 3 (Sun 6 Dec).</li>
        <li><strong>Group of 7:</strong> some places can’t seat seven together without booking, so split into two tables or eat at markets. You already have tickets for 7 at the Tower, Winter Wonderland, the NHM and the British Museum.</li>
        <li><strong>Your 16–17-year-old</strong> pays adult pay-as-you-go fares on contactless (the 16+ Zip Oyster discount is only for London residents). Bring ID anyway for youth prices at attractions.</li>
        <li><strong>Museums:</strong> the national museums are free. Donations are welcome and bags are checked at the door.</li>
        <li><strong>Students:</strong> always ask for the student or concession rate, and carry photo student ID.</li>
        <li><strong>Money:</strong> contactless is accepted almost everywhere, and many places are card-only. Restaurants often add a 12.5% service charge, so check the bill before tipping.</li>
        <li><strong>Phones:</strong> UK plugs are Type G. Emergency number 999, non-urgent medical help 111.</li>
        <li><strong>Pickpockets</strong> work Oxford Street, Leicester Square, Covent Garden and Winter Wonderland crowds. Use a zipped front pocket.</li>
      </ul>`,
    },
  ],
  tipsSources: [
    { label: "TfL fares", url: "https://tfl.gov.uk/fares" },
    { label: "TfL contactless & Oyster", url: "https://tfl.gov.uk/fares/how-to-pay-and-where-to-buy-tickets-and-oyster/pay-as-you-go/capping" },
    { label: "Thames Clippers prices", url: "https://www.thamesclippers.com/plan-your-journey/ticket-information" },
  ],

  /* ------------------------------------------------------------------ DAYS */
  days: [
    /* ============================== DAY 1 ============================== */
    {
      title: "Westminster, the City & Winter Wonderland",
      line: { name: "Royal line", colour: "#dc241f" },   // this day’s colour on the trip map
      neighbourhoods: ["St James’s", "Westminster", "Trafalgar Square", "Covent Garden", "Tower Hill", "Hyde Park", "Chinatown"],
      nutshell: "Royal London in one sweep: the palace and the guards, then the nation’s paintings and Parliament. After lunch you swap crowns for the Crown Jewels at the Tower, and finish among the fairground lights of Hyde Park and the lanterns of Chinatown.",
      alerts: [
        {
          level: "minor",
          title: "Early start: you land at Luton at 06:55",
          html: `<p>Flight W4 3645 lands at 06:55. Allow about 1h15 from landing to Mill Hill (passport control, then the DART shuttle to Luton Airport Parkway, then Thameslink direct to Mill Hill Broadway, about 25 min). That makes 08:30 breakfast realistic if passport control is quick. You only have under-seat bags, so drop them at the accommodation if you can, or carry them.</p>
                 <p>This is the longest walking day after a 05:40 flight. Winter Wonderland is booked for 17:00–18:00 entry, and Chinatown is optional if you’re flagging.</p>
                 <p><strong>Good news on the guard:</strong> Friday is one of the usual winter ceremony days (Mon/Wed/Fri/Sun at 11:00). Check the official calendar, which is published about six weeks ahead. If it’s cancelled for rain, the mounted King’s Life Guard at Horse Guards Parade (11:00) is the backup.</p>`,
        },
        {
          level: "clash",
          title: "The Westminster walk and the Tower overlap",
          html: `<p>The walk starts at 14:00 but the Tower is booked from 14:15. Walking Covent Garden → Big Ben → Westminster Bridge takes about 40 minutes, and the Tube to Tower Hill another 15–20, so you’d arrive near 15:00. That is the Tower’s winter last entry. It also closes at <strong>16:30</strong>, not 16:45, and you need 35–40 min to reach Hyde Park for your booked 17:00–18:00 entry.</p>
                 <p><strong>Suggested day, same stops:</strong></p>
                 <ol>
                   <li>10:15 Buckingham Palace</li>
                   <li>11:00 Guard (palace if it’s on, otherwise Horse Guards)</li>
                   <li>11:30 Whitehall → Big Ben → Westminster Bridge, in daylight</li>
                   <li>12:20 Trafalgar Square and National Gallery</li>
                   <li>13:15 Lunch in Covent Garden</li>
                   <li>14:00 Tube from Embankment to Tower Hill</li>
                   <li>14:30–16:30 Tower of London</li>
                   <li>17:00–18:00 Winter Wonderland (booked entry window)</li>
                   <li>Chinatown</li>
                 </ol>`,
        },
      ],
      items: [
        {
          id: "d1-leg0", type: "travel", time: "06:55", mode: "train", modeLabel: "Land at Luton → DART + Thameslink",
          from: "London Luton Airport", to: "Mill Hill Broadway",
          detail: "Flight W4 3645 lands at 06:55. Take the Luton DART to Luton Airport Parkway (about 4 min, separate charge), then Thameslink direct to Mill Hill Broadway (about 25 min). Touch the same contactless card in and out.",
        },
        {
          id: "d1-breakfast", wiki: ["Gail's", "Mill Hill"], type: "food", time: "08:30",
          name: "Breakfast: Gail’s or Joe & The Juice",
          area: "Mill Hill Broadway",
          teaser: "A proper London bakery breakfast before the big day, two minutes from the station.",
          myNotes: ["Budget £6–12.", "Original note said “gails / Joice”, meaning Gail’s Bakery or Joe & The Juice."],
          food: {
            knownFor: "Gail’s is a London bakery chain that began as a wholesale bakery supplying restaurants in the 1990s. It’s known for sourdough, cinnamon buns and generous savoury pastries.",
            order: "A cinnamon bun or almond croissant plus a flat white. For something filling, a bacon or egg-and-greens brioche roll.",
            price: "£6–12 per person",
            alternatives: "Joe & The Juice (Danish juice-and-toastie bar) if you’d rather have a tunacado sandwich and a smoothie. There may not be one in Mill Hill itself.",
          },
          story: ["Gail’s at 88 The Broadway is a few steps from Mill Hill Broadway station, so you can eat and still make the 09:15 Thameslink. Mill Hill was once a quiet village on a ridge north of London: the botanist Peter Collinson planted rare trees here in the 1700s, and Sir Stamford Raffles, founder of modern Singapore and of London Zoo, retired to Mill Hill and is buried in St Mary’s, Hendon. Fuel up: today is the longest walking day of the trip."],
          checks: ["The nearest Joe & The Juice may not be in Mill Hill. Gail’s, 88 The Broadway, NW7 3TB, is confirmed. Check opening time if you go before 08:00."],
          mapQuery: "GAIL's Bakery Mill Hill, 88 The Broadway, London NW7 3TB",
          sources: [{ label: "GAIL’s Bakery", url: "https://gailsbread.co.uk/" }],
        },
        {
          id: "d1-leg1", type: "travel", time: "09:15", mode: "train", modeLabel: "Thameslink + Victoria line",
          from: "Mill Hill Broadway", to: "Green Park",
          detail: "Thameslink to St Pancras (~20 min), then the Victoria line from King’s Cross to Green Park (~10 min). From there it’s a 10-min walk through Green Park to the palace. About 50 min door to door.",
        },
        {
          id: "d1-palace", wiki: ["Buckingham Palace"], type: "sight", time: "10:15",
          name: "Buckingham Palace & the Mall",
          area: "St James’s · with Trafalgar Square later",
          teaser: "The world’s most photographed front door, and the red road that leads to it.",
          myNotes: ["Planned as “Buckingham Palace / Trafalgar Square”. Trafalgar Square is stop 4, on the way to the National Gallery."],
          light: "day", free: true,
          story: [
            "It began as a house, not a palace. In 1703 the Duke of Buckingham built a grand brick townhouse at the end of St James’s Park. In 1761 George III bought it as a family home for Queen Charlotte, and fourteen of their fifteen children were born here. Their son George IV hired John Nash to turn it into a palace, spent a fortune, and died before he could live in it.",
            "Queen Victoria was the first monarch to move in, in 1837. She found that chimneys smoked, doors didn’t lock and drains leaked. She stepped onto the famous balcony in 1851 to celebrate the opening of the Great Exhibition, and royal families have waved from it ever since.",
            "The façade you see is the newest part. It was refaced in Portland stone in 1913 in just thirteen weeks, while the King was away. Behind it are 775 rooms, including 78 bathrooms, and the working offices of the monarchy. Check the flagpole: the Royal Standard flies when the King is in residence, and the Union Flag when he isn’t. Then turn around. The road behind you, the Mall, is tinted red to look like a royal carpet laid all the way to Trafalgar Square.",
          ],
          facts: [
            "Marble Arch, now stranded on a traffic island at Hyde Park’s corner, was built as the palace’s grand gateway. It was moved in 1851 when the east wing closed off the courtyard.",
            "The gilded figure on top of the Victoria Memorial is Winged Victory. The memorial was unveiled in 1911 and uses about 2,300 tonnes of marble.",
            "The palace has its own post office, chapel and cinema, and around 800 people work there.",
            "During the Second World War the palace was bombed nine times. Queen Elizabeth, the future Queen Mother, said she was glad, because she could now “look the East End in the face”.",
            "The State Rooms only open to visitors in summer. In December, admiring it from the railings is the only option.",
          ],
          lookFor: [
            "<strong>The flag on the roof.</strong> The Royal Standard (red, gold and blue quarters) means the King is home. The Union Flag means he’s out.",
            "<strong>The guardsmen’s buttons.</strong> The five Foot Guards regiments are told apart by button spacing. Singles mean Grenadiers, pairs Coldstream, threes Scots, fours Irish and fives Welsh. The plume on the bearskin helps too.",
            "<strong>The Victoria Memorial’s gold.</strong> Climb its steps for the classic straight-down-the-Mall photo towards Admiralty Arch.",
          ],
          practical: {
            hours: "Exterior and memorial: any time. State Rooms closed in winter.",
            cost: "Free to look",
            booking: "None",
            station: "Green Park or St James’s Park (8–10 min walk)",
            allow: "30–45 min",
          },
          mapQuery: "Buckingham Palace, London",
          sources: [{ label: "Royal Collection Trust", url: "https://www.rct.uk/visit/buckingham-palace" }, { label: "The Royal Family", url: "https://www.royal.uk/royal-residences-buckingham-palace" }],
        },
        {
          id: "d1-guard", wiki: ["King's Guard", "Horse Guards Parade"], type: "sight", time: "11:00",
          name: "Changing of the Guard",
          area: "Buckingham Palace forecourt, or Horse Guards Parade",
          teaser: "Bearskins, brass and a ritual older than the palace. Friday is normally a ceremony day.",
          light: "day", free: true,
          story: [
            "Soldiers have guarded the sovereign since Henry VII. The ceremony you’ll see dates from 1660, when Charles II returned from exile and created a standing army that included the Foot Guards. The guard has been posted at Buckingham Palace since Victoria moved there in 1837.",
            "What looks like a parade is a real handover. The Old Guard, who have spent 24 hours protecting the palace and St James’s Palace, march out and hand responsibility, symbolically the keys, to the New Guard. A military band plays during the changeover, and its repertoire has stretched to ABBA, film themes and even Game of Thrones.",
            "If the palace ceremony is cancelled (it happens in heavy rain), walk ten minutes east through St James’s Park to <strong>Horse Guards Parade</strong>. The Household Cavalry, in plumed helmets and polished breastplates, have mounted the King’s Life Guard there since 1660. The arch they guard was once the official entrance to the royal palaces, and only the monarch may drive through it. There’s a good story here too. In 1894 Queen Victoria is said to have arrived unannounced and found the guards drinking and gambling. She ordered an inspection at 4pm every day for 100 years. The 100 years ran out long ago, and the Four O’Clock Parade still happens.",
          ],
          facts: [
            "Bearskins are made from the fur of Canadian black bears and stand about 45 cm tall.",
            "The ceremony lasts about 45 minutes. Arrive by 10:30 to get a spot at the railings or on the Victoria Memorial steps.",
            "The Foot Guards are serving soldiers who have fought in Afghanistan and Iraq. The ceremony is a duty, not a costume.",
            "The ceremony is usually cancelled in very wet weather, sometimes as late as 10:45 on the day.",
            "At Horse Guards the mounted sentries change every hour. The horses are trained to stay calm when tourists approach, but signs warn that they may kick or bite.",
          ],
          lookFor: [
            "<strong>The two guards meeting</strong> in the palace forecourt, where the Old and New Guard face each other for the handover.",
            "<strong>The clock above Horse Guards arch.</strong> A black mark at the two o’clock position is said to record the hour of Charles I’s execution in 1649, which took place just across the road.",
            "<strong>The plume colours</strong> on the bearskins: white (Grenadiers), red (Coldstream), none (Scots), blue (Irish) and green-and-white (Welsh).",
          ],
          practical: {
            hours: "Palace ceremony 11:00 on scheduled days (winter: usually Mon/Wed/Fri/Sun). Horse Guards: 11:00 Mon–Sat, 10:00 Sun.",
            cost: "Free",
            booking: "None, but arrive 30–45 min early for a front spot",
            station: "Green Park, St James’s Park, or Charing Cross for Horse Guards",
            allow: "45 min",
          },
          checks: [
            "Fri 4 Dec ceremony status on the Household Division calendar, published about six weeks ahead. Friday is normally a winter ceremony day, but it can be cancelled for weather or state events. Backup: Horse Guards Parade at 11:00.",
            "Horse Guards: some sources say the full change runs Mon/Wed/Fri, with an inspection at 11:00 on weekends. Either way there are mounted troopers at 11:00.",
          ],
          mapQuery: "Horse Guards Parade, London",
          sources: [{ label: "Household Division – Changing the Guard", url: "https://www.householddivision.org.uk/changing-the-guard-calendar" }, { label: "Royal Parks – Horse Guards Parade", url: "https://www.royalparks.org.uk/visit/parks/st-jamess-park/horse-guards-parade" }, { label: "British Army", url: "https://www.army.mod.uk/events/changing-of-the-guard/" }],
        },
        {
          id: "d1-gallery", wiki: ["National Gallery"], type: "sight", time: "12:00",
          name: "Trafalgar Square & the National Gallery",
          area: "Trafalgar Square",
          teaser: "Nelson on his column, four bronze lions, and Van Gogh’s Sunflowers. All free.",
          myNotes: ["Free entry."],
          free: true,
          story: [
            "In 1824 Parliament paid £57,000 for the collection of a recently deceased Russian-born banker, John Julius Angerstein: just 38 paintings. They were hung in his old townhouse on Pall Mall, and that was the National Gallery. Visitors complained it was dingy and cramped, so in 1838 the collection moved into William Wilkins’s building on the north side of the new Trafalgar Square. It was placed there deliberately, between the rich West End and the poorer East, so everyone could reach it.",
            "Today there are more than 2,300 paintings, from Giotto to Cézanne, and you can walk in without paying a penny. During the Blitz the whole collection was hidden in a slate mine at Manod in Wales. Londoners missed it so much that the gallery brought back one painting a month to hang alone, the “Picture of the Month”. Meanwhile the pianist Myra Hess gave lunchtime concerts in the empty rooms, and over six years about 1,700 concerts were played to more than 800,000 people.",
            "Outside, Nelson stands on his 52-metre column looking south towards the sea, guarded by Landseer’s lions. Legend says Landseer worked from a dead lion that took so long to sculpt it began to rot, and that’s why the paws look suspiciously like a house cat’s.",
          ],
          facts: [
            "Holbein’s <em>The Ambassadors</em> hides a stretched skull across the floor. Stand close to the right edge of the painting and look back: it snaps into shape.",
            "In 1961 Goya’s portrait of the Duke of Wellington was stolen by Kempton Bunton, a retired bus driver in his late fifties, protesting about TV licence fees. It came back four years later. The story became the film <em>The Duke</em>.",
            "On the north terrace wall, brass plates set in 1876 show the official Imperial inch, foot and yard. You can measure yourself against the nation’s standards.",
            "On the south-east corner of the square stands a hollowed-out stone lamp post with a window. It’s often called Britain’s smallest police station, built in the 1920s so an officer could watch for trouble.",
            "Every December, Norway sends a giant Christmas tree for the square as thanks for Britain’s help in the Second World War, a tradition since 1947. It should be lit by the time you visit.",
          ],
          lookFor: [
            "<strong>Van Gogh’s <em>Sunflowers</em></strong> (1888), painted to decorate Gauguin’s bedroom in Arles.",
            "<strong>The convex mirror in Van Eyck’s <em>Arnolfini Portrait</em></strong> (1434). It reflects two tiny figures in the doorway, probably including the painter himself.",
            "<strong>The Imperial measures</strong> on the terrace wall, and the Norwegian Christmas tree in the square below.",
          ],
          practical: {
            hours: "Daily 10:00–18:00, Fridays until 21:00 (today is Friday, so you could come back after Winter Wonderland)",
            cost: "Free (some special exhibitions charge)",
            booking: "Not needed for the main collection",
            station: "Charing Cross or Leicester Square",
            allow: "1 hour for the greatest hits. Pick up a map, or follow the “highlights” route.",
          },
          checks: ["Gallery hours and any room closures on nationalgallery.org.uk, and the Trafalgar Square tree-lighting date (usually the first Thursday of December)."],
          mapQuery: "The National Gallery, Trafalgar Square, London",
          sources: [{ label: "The National Gallery", url: "https://www.nationalgallery.org.uk/visiting" }, { label: "Greater London Authority – Trafalgar Square", url: "https://www.london.gov.uk/programmes-strategies/arts-and-culture/current-culture-projects/trafalgar-square" }],
        },
        {
          id: "d1-lunch", wiki: ["Covent Garden"], type: "food", time: "13:00",
          name: "Lunch: Pizza Pilgrims, Covent Garden",
          area: "23 Garrick Street, WC2",
          teaser: "Neapolitan pizza from two brothers who learned the trade driving a three-wheeled van round Italy.",
          myNotes: ["“Maybe Pizza Pilgrims”. Budget £15–20."],
          food: {
            knownFor: "Proper Neapolitan pizza: puffy, leopard-spotted crust and a 60–90 second bake in a wood-style oven. Brothers Thom and James Elliot spent six weeks in 2011 touring Italy in a tiny Piaggio Ape van, learning from pizzaioli, then sold pizza from the same van on Berwick Street market in Soho.",
            order: "Nduja (spicy Calabrian sausage) or a classic Margherita. Share a Nutella pizza ring if you’re sweet-toothed.",
            price: "£12–20 for a pizza and a soft drink",
            alternatives: "Covent Garden Market’s food stalls, or Dishoom (expect queues) if it’s cold and you want a proper sit-down.",
          },
          story: ["Garrick Street is named after David Garrick, the great 18th-century actor-manager. The Garrick Club, a members’ club for actors and writers since 1831, is on the same street. Pizza Pilgrims here is walk-in only, so go just before 13:00 or after 13:45 to beat the lunch rush."],
          mapQuery: "Pizza Pilgrims Covent Garden, 23 Garrick Street, London",
          sources: [{ label: "Pizza Pilgrims", url: "https://pizzapilgrims.co.uk/pizzerias/covent-garden" }, { label: "Covent Garden", url: "https://www.coventgarden.london/restaurants/pizza-pilgrims" }],
        },
        {
          id: "d1-walk", wiki: ["St Paul's, Covent Garden", "Covent Garden"], type: "walk", time: "14:00",
          name: "Walk: Covent Garden → Strand → Whitehall",
          area: "Covent Garden, Strand, Whitehall",
          teaser: "London’s first square, the actors’ church, a 300-year-old tea shop and the street where a king lost his head.",
          suggestedTime: "11:30", suggestedWhy: "do Whitehall and Westminster in the morning after the guard and save the afternoon for the Tower. See the day’s timing note.",
          light: "day",
          story: [
            "Covent Garden began as the “convent garden” of Westminster Abbey’s monks. After Henry VIII took the Church’s land, the Earls of Bedford owned it. In the 1630s the 4th Earl hired Inigo Jones to lay out something London had never seen: an Italian-style piazza, the city’s first planned square. The Earl told Jones to build a church “not much better than a barn”, and Jones promised him “the handsomest barn in England”. That’s St Paul’s, Covent Garden, now known as the Actors’ Church.",
            "Its grand portico facing the square is fake. The altar is behind it, so the real entrance is round the back in the churchyard. Under that portico, on 9 May 1662, Samuel Pepys watched an Italian puppet show: the first recorded Punch and Judy in England. Professor Higgins first meets Eliza Doolittle there too, in <em>My Fair Lady</em>.",
            "Walk down to the Strand, the old riverbank “strand” before the Embankment was built, and along to Trafalgar Square. Then turn down Whitehall, past the Horse Guards and Downing Street’s gates. At the Banqueting House, on a freezing January day in 1649, Charles I walked out of an upper window onto a scaffold to be executed. He wore two shirts so he wouldn’t shiver and look afraid. Inside, the ceiling he walked under was painted by Rubens.",
          ],
          facts: [
            "The fruit and vegetable market only left Covent Garden in 1974, moving to Nine Elms. The Victorian market hall became shops.",
            "Twinings has sold tea from 216 Strand since 1706. Its logo, set up in 1787, is believed to be the oldest in continuous use in the world.",
            "The statue of Charles I at the top of Whitehall marks the spot from which distances to London are measured. After his execution the statue was sold for scrap to a brazier who claimed to have melted it down, while selling “relics” supposedly made from it. He’d actually hidden it, and it was put back in 1675.",
            "Downing Street’s gates only went up in 1989. Before that you could walk past No. 10’s door.",
            "The Cenotaph on Whitehall was designed by Edwin Lutyens. It has no straight lines: its surfaces curve so subtly they would meet about 300 m up.",
          ],
          lookFor: [
            "<strong>The Punch and Judy plaque</strong> on the portico of St Paul’s Church, Covent Garden.",
            "<strong>Twinings’ doorway</strong> at 216 Strand, with its golden lion and two Chinese figures.",
            "<strong>The Banqueting House</strong> on Whitehall. Find the upper window used for the execution, marked by a bust of Charles I above the entrance.",
          ],
          practical: {
            hours: "Outdoors, any time. Daylight until about 15:50.",
            cost: "Free",
            booking: "None",
            station: "Start: Covent Garden. End: Westminster.",
            allow: "40–60 min at a stroll (about 2 km)",
          },
          mapQuery: "St Paul's Church Covent Garden",
          sources: [{ label: "St Paul’s Church, Covent Garden", url: "https://actorschurch.org/" }, { label: "Historic Royal Palaces – Banqueting House", url: "https://www.hrp.org.uk/banqueting-house/" }, { label: "Twinings 216 Strand", url: "https://twinings.co.uk/pages/216-strand" }],
        },
        {
          id: "d1-parliament", wiki: ["Palace of Westminster"], type: "sight", time: "14:30",
          name: "Big Ben, Parliament & Westminster Bridge",
          area: "Westminster",
          teaser: "A Gothic palace born from a bonfire of tax sticks, and the most famous clock on Earth.",
          suggestedTime: "11:45", suggestedWhy: "in daylight, before the National Gallery",
          light: "day", free: true,
          story: [
            "On 16 October 1834 workmen were told to get rid of two cartloads of old “tally sticks”, notched wooden sticks the Exchequer had used for centuries to record taxes. They stuffed them into the furnaces under the House of Lords. By evening the medieval Palace of Westminster was ablaze, and crowds lined the river to watch. Turner painted it.",
            "What rose from the ashes was the building you see: Charles Barry’s plan, smothered in Gothic detail by the brilliant and exhausted Augustus Pugin. The clock tower was Pugin’s last design before he went mad. Only <strong>Westminster Hall</strong>, built in 1097 under William II, survived the fire. It has one of the finest medieval timber roofs in Europe and is the oldest part of the estate.",
            "“Big Ben” is strictly the 13.7-tonne bell, not the tower, which was renamed the Elizabeth Tower in 2012. The bell cracked soon after it was first rung, in 1859. Rather than recast it, engineers turned it slightly and fitted a lighter hammer, and the crack gives Big Ben its distinctive tone. The clock is kept accurate with old pennies: add one to the pendulum and the clock gains about 0.4 seconds a day.",
            "Walk onto Westminster Bridge for the classic view. Wordsworth stood on its predecessor in 1802 and wrote “Earth has not anything to show more fair”.",
          ],
          facts: [
            "Westminster Bridge is painted green, like the leather benches of the House of Commons, the end of the palace nearest it. Lambeth Bridge, at the Lords’ end, is red to match the Lords’ benches.",
            "Under each clock face runs a Latin inscription: <em>Domine salvam fac Reginam nostram Victoriam primam</em>, “O Lord, keep safe our Queen Victoria the First”.",
            "A light at the very top of the tower, the Ayrton Light, shines when either House is sitting after dark.",
            "The monarch may not enter the House of Commons. The rule dates from 1642, when Charles I burst in to arrest five MPs. That’s why Black Rod has the Commons door slammed in his or her face at the State Opening.",
            "The 2017–2022 restoration repainted the clock dials in their original Prussian blue, not the black of the 20th century.",
          ],
          lookFor: [
            "<strong>Boudicca in her chariot</strong> at the west end of Westminster Bridge. The warrior queen who burned Roman London now guards Parliament.",
            "<strong>The Ayrton Light</strong> above the clock. Lit means MPs or peers are at work.",
            "<strong>The bridge’s colour</strong>: green here, red on Lambeth Bridge to the south.",
          ],
          practical: {
            hours: "Exterior: any time. Guided tours of Parliament (mostly Saturdays) aren’t in your plan.",
            cost: "Free to look. Tours are paid.",
            booking: "Only for tours (parliament.uk)",
            station: "Westminster",
            allow: "30 min",
          },
          mapQuery: "Westminster Bridge, London",
          sources: [{ label: "UK Parliament – Big Ben", url: "https://www.parliament.uk/bigben" }, { label: "UK Parliament – the 1834 fire", url: "https://www.parliament.uk/about/living-heritage/building/palace/architecture/palacestructure/fire-of-1834/" }],
        },
        {
          id: "d1-leg2", type: "travel", mode: "tube", modeLabel: "Tube (District/Circle)",
          from: "Westminster", to: "Tower Hill",
          detail: "Eastbound District or Circle line, 7 stops, about 15 min. With the suggested timing, catch it from <b>Embankment</b> after lunch (14:00).",
        },
        {
          id: "d1-tower", wiki: ["Tower of London"], type: "sight", time: "14:15", endTime: "16:45",
          name: "Tower of London",
          area: "Tower Hill",
          teaser: "Fortress, palace, prison, zoo and treasure-house: 950 years of London in one walled square mile of stories.",
          myNotes: ["Student tickets: bought."],
          suggestedTime: "14:30", suggestedEnd: "16:30", suggestedWhy: "the Tower closes at 16:30 in winter and last entry is about 15:00",
          light: "day",
          booked: { summary: "Fri 4 Dec · all-day admission · 6 × Student 18+ and 1 × Young Person 16–17", note: "Bring student ID; staff may check it at the gate. The tickets are valid all day, but in winter last entry is about 15:00." },
          story: [
            "William the Conqueror needed Londoners to understand who was in charge. In the 1070s he began a stone keep so enormous that nobody in the city had seen anything like it: the White Tower, whitewashed so it gleamed over the river. Every monarch since has added something. Walls, moats and towers made it the strongest fortress in the land, and it also served as a royal palace, the national mint, an armoury and the home of the Crown Jewels.",
            "It’s also the place where people were taken and often didn’t come back. Anne Boleyn was beheaded on Tower Green in 1536 by a swordsman brought over from Calais. Lady Jane Grey, queen for nine days, died there in 1554. Princess Elizabeth, later Elizabeth I, was brought in as a prisoner in 1554, by tradition through Traitors’ Gate, sure she would die. The two young “Princes in the Tower” vanished in 1483. Prisoners carved their names into the walls of the Beauchamp Tower, and you can still read them.",
            "The Tower’s guardians are the Yeoman Warders, nicknamed Beefeaters, who live inside the walls with their families. So do the ravens. Legend says that if they ever leave, the kingdom will fall, so at least six are always kept, with a spare, and fed on raw meat and blood-soaked biscuits by the Ravenmaster.",
          ],
          facts: [
            "The Tower had a royal zoo for 600 years. In 1252 a polar bear, a gift from the King of Norway, was allowed to fish in the Thames on a long chain.",
            "In 1671 Colonel Thomas Blood stole the Crown Jewels by flattening the crown with a mallet and stuffing the orb down his breeches. He was caught at the gate. Charles II pardoned him and gave him land in Ireland. Nobody knows quite why.",
            "The Sovereign’s Sceptre holds Cullinan I, the Great Star of Africa. At 530 carats it is the largest colourless cut diamond in the world.",
            "The last execution at the Tower was in 1941: Josef Jakobs, a German spy, shot by firing squad while sitting in a chair because of a broken ankle.",
            "Every night at 21:53 the Ceremony of the Keys locks the Tower, as it has for about 700 years. It even went ahead during the Blitz, delayed only once when a bomb blew the escort off their feet.",
          ],
          lookFor: [
            "<strong>Prisoners’ graffiti</strong> in the Beauchamp Tower, including the word “IANE” carved on the wall, thought to refer to Lady Jane Grey.",
            "<strong>Traitors’ Gate</strong>, the water entrance from the Thames, now bricked off from the river.",
            "<strong>The ravens</strong> near the Wakefield Tower. Each has a name and a coloured leg band, and the Warders will tell you which is the troublemaker.",
          ],
          practical: {
            hours: "Winter (Nov–Feb): Tue–Sat 09:00–16:30, Sun–Mon 10:00–16:30. Last entry about 15:00.",
            cost: "Student (18+, with ID) about £29.50 online, adult about £37. Includes the Crown Jewels and Yeoman Warder tours.",
            booking: "Booked: Fri 4 Dec, all day",
            station: "Tower Hill (District/Circle), or Tower Gateway (DLR)",
            allow: "2½–3 hours. Do the Crown Jewels first, then join a Yeoman Warder tour (about every 30 min, last one around 14:30 in winter).",
          },
          checks: [
            "Winter last-admission time: sources say 15:00 or 15:30. Aim to be inside by 15:00.",
          ],
          mapQuery: "Tower of London",
          sources: [{ label: "Historic Royal Palaces – Tower of London", url: "https://www.hrp.org.uk/tower-of-london/" }, { label: "HRP – tickets & prices", url: "https://www.hrp.org.uk/tower-of-london/visit/tickets-and-prices/" }],
        },
        {
          id: "d1-leg3", type: "travel", mode: "tube", modeLabel: "Tube",
          from: "Tower Hill", to: "Hyde Park Corner or Marble Arch",
          detail: "About 35–40 min. The easiest route is District/Circle to Monument, walk through to Bank, then the Central line to Marble Arch. Alternatively, District/Circle to Victoria, Victoria line to Green Park, then the Piccadilly line one stop to Hyde Park Corner.",
        },
        {
          id: "d1-ww", wiki: ["Hyde Park Winter Wonderland", "Hyde Park, London"], type: "sight", time: "17:00",
          name: "Hyde Park Winter Wonderland",
          area: "Hyde Park",
          teaser: "A Bavarian village, an ice kingdom and a giant wheel in a royal hunting ground. Timed entry, so book.",
          suggestedTime: "17:10", suggestedWhy: "allow 35–40 min from the Tower; your booked entry window is 17:00–18:00",
          light: "night",
          booked: { summary: "Fri 4 Dec · entry window 17:00–18:00 · 7 × adult/teen · £38.50 total", note: "Tickets are with the person who booked. Have them on a phone at the gate." },
          story: [
            "Before the fairground, Hyde Park was Henry VIII’s deer park, taken from the monks of Westminster Abbey in 1536 so he’d have somewhere to hunt close to town. Charles I opened it to the public in 1637, and Londoners have been coming here for fun ever since: duels, highwaymen, horse racing, and in 1851 the Great Exhibition, in a glasshouse so vast it enclosed fully grown elm trees.",
            "The ride through the park, Rotten Row, gets its name from the king’s road, the <em>route du roi</em>. William III had it hung with oil lamps in the 1690s to deter highwaymen, making it the first artificially lit road in England. Queen Caroline created the Serpentine lake in 1730 by damming a stream.",
            "Winter Wonderland started in 2007 and has grown into one of Europe’s biggest Christmas fairs. Expect a giant observation wheel, ice skating around a Victorian bandstand, a circus, ice sculptures in the Magical Ice Kingdom, and more mulled wine, bratwurst and churros than is sensible. Entry itself is cheap; it’s the rides and food that add up. Set a budget, and remember that every attraction charges separately.",
          ],
          facts: [
            "Winter Wonderland 2026 runs from 19 Nov 2026 to 3 Jan 2027 (closed Christmas Day), 10:00–22:00 on most days, with last entry at 21:30.",
            "Entry is by timed slot. Advance prices range from about £1 off-peak to about £8.25 peak (Friday and weekend evenings are peak). Rides, rink and shows cost extra.",
            "The Great Exhibition of 1851 drew about six million visitors. Its profits helped found the museums you’ll see tomorrow in South Kensington.",
            "Speakers’ Corner, at the Marble Arch end of the park, has been a home for soapbox free speech since the 1870s.",
          ],
          lookFor: [
            "<strong>The view from the giant wheel</strong> back over Park Lane and the lit-up West End (paid ride).",
            "<strong>The Bavarian Village</strong> with its timber-framed bars, the most photogenic corner after dark.",
          ],
          practical: {
            hours: "Most days 10:00–22:00, last entry 21:30",
            cost: "Entry booked (£38.50 for 7). Rides and attractions extra. Mostly cashless.",
            booking: "Booked: Fri 4 Dec, 17:00–18:00 entry window",
            station: "Marble Arch (Central) or Hyde Park Corner (Piccadilly)",
            allow: "1½–2 hours",
          },
          mapQuery: "Hyde Park Winter Wonderland, London",
          sources: [{ label: "Hyde Park Winter Wonderland – tickets guide", url: "https://hydeparkwinterwonderland.com/tickets-guide/" }, { label: "Royal Parks – Hyde Park history", url: "https://www.royalparks.org.uk/visit/parks/hyde-park/history-and-architecture" }],
        },
        {
          id: "d1-chinatown", wiki: ["Chinatown, London"], type: "food", when: "Evening",
          name: "Chinatown",
          area: "Gerrard Street & Lisle Street, Soho",
          teaser: "Red lanterns, roast duck in the windows and egg tarts for the Tube home.",
          light: "night",
          food: {
            knownFor: "Cantonese roast meats, dim sum, hand-pulled noodles, Hong Kong bakeries and bubble tea, all in three lantern-hung streets.",
            order: "Roast duck or char siu on rice (a cheap, filling classic), steamed bao, or soup dumplings. Finish with a custard egg tart from a bakery.",
            price: "£8–20 per person",
            alternatives: "If it’s heaving, head 5 minutes north to Soho or try the Japanese bakeries around Leicester Square.",
          },
          story: [
            "London’s first Chinatown wasn’t here at all. It was in Limehouse in the East End, where Chinese sailors settled near the docks in the late 1800s. After wartime bombing and slum clearance destroyed it, Chinese restaurants began opening in the 1950s and 60s in the cheap, run-down streets of Soho, especially Gerrard Street. Returning British servicemen had developed a taste for Chinese food in Asia, and the business followed.",
            "Gerrard Street had a whole life before that. The poet John Dryden lived here, and so did the statesman Edmund Burke. In 1959 Ronnie Scott opened his first jazz club in a basement here. In 1968 a new band held its first rehearsal in a basement on the same street; they became Led Zeppelin.",
          ],
          facts: [
            "The ornate gate on Wardour Street, opened in 2016, is built in Qing-dynasty style and is the largest of Chinatown’s gates.",
            "Street signs here are bilingual, in English and Chinese.",
            "Chinatown hosts one of the largest Chinese New Year celebrations outside Asia, spilling into Trafalgar Square.",
          ],
          lookFor: [
            "<strong>Blue plaques</strong> on Gerrard Street to John Dryden and Edmund Burke.",
            "<strong>The Wardour Street gate</strong> lit up at night, the best photo in the area.",
          ],
          practical: {
            hours: "Most restaurants open until 22:30–23:30",
            cost: "Budget-friendly; card accepted almost everywhere",
            booking: "Walk in",
            station: "Leicester Square",
            allow: "1 hour or so",
          },
          mapQuery: "Chinatown London, Gerrard Street",
          sources: [{ label: "Chinatown London", url: "https://chinatown.co.uk/en/" }, { label: "Historic England – Gerrard Street", url: "https://historicengland.org.uk/" }],
        },
      ],
    },

    /* ============================== DAY 2 ============================== */
    {
      title: "Notting Hill, Kensington museums & Southbank",
      line: { name: "Museum line", colour: "#00782a" },   // this day’s colour on the trip map
      neighbourhoods: ["Notting Hill", "Portobello Road", "South Kensington", "Kensington", "Knightsbridge", "Oxford Street", "South Bank"],
      nutshell: "Pastel houses and bookshops in the morning, then two of the world’s great free museums back to back: dinosaurs and a blue whale, then silver, fashion and a plaster David. Shopping at Harrods and on Oxford Street follows, and the evening ends with mulled wine by the river under the lights of the Southbank.",
      alerts: [
        {
          level: "minor",
          title: "Tight changeovers",
          html: `<ul>
            <li><strong>Portobello → Natural History Museum:</strong> Notting Hill Gate to South Kensington is 3 stops (about 20 min door to door). Leave Portobello by about <strong>10:35</strong> to make an 11:00 booked slot.</li>
            <li><strong>Wagamama Kensington</strong> (Kensington High Street) is about 20 min’s walk from the museums each way. That works, just about, for 14:30. If time is short, eat at the <strong>V&amp;A Café</strong> instead, the world’s first museum restaurant (see the V&amp;A page).</li>
            <li><strong>Saturday crowds:</strong> Portobello on a Saturday is the full market and antiques day, so it’s wonderful but packed. Oxford Street on a December Saturday is the busiest shopping street in Europe. Keep bags zipped.</li>
          </ul>`,
        },
      ],
      items: [
        {
          id: "d2-leg1", type: "travel", time: "08:00", mode: "train", modeLabel: "Thameslink + Hammersmith & City",
          from: "Mill Hill Broadway", to: "Ladbroke Grove / Notting Hill",
          detail: "Thameslink to St Pancras, then the Hammersmith &amp; City line from King’s Cross to Ladbroke Grove (about 20 min). That brings you out at the top of Portobello Road. About 55 min in total. Weekend engineering works are common, so check TfL Go the night before.",
        },
        {
          id: "d2-breakfast", wiki: ["Notting Hill"], type: "food", time: "09:00",
          name: "Breakfast: a Notting Hill bakery",
          area: "Portobello Road & Westbourne Grove",
          teaser: "Cardamom buns, flaky croissants and a flat white on London’s prettiest street.",
          myNotes: ["Coffee + breakfast. Budget £6–12."],
          food: {
            knownFor: "Notting Hill has a dense cluster of independent bakeries and brunch cafés along Portobello Road and Westbourne Grove.",
            order: "<strong>Layla</strong> (332 Portobello Rd) for croissants and jam bow-ties; go early, they sell out. <strong>Farm Girl</strong> (59A Portobello Rd) for avocado toast and a rose latte. <strong>Granger &amp; Co</strong> (175 Westbourne Grove) for ricotta hotcakes, a pricier splurge.",
            price: "£6–12 (Granger &amp; Co more like £15–20)",
            alternatives: "Gail’s and other chain bakeries are scattered along Westbourne Grove if the independents have queues.",
          },
          story: ["Portobello Road is named after Porto Bello in Panama, captured by Admiral Vernon in 1739. Patriotic Londoners named a farm after the victory, and the farm track became the road. The first market traders were Romany horse-dealers and herb sellers in the 1800s. The antiques arrived after the Second World War."],
          checks: ["Saturday opening time for the bakery you pick (most open 08:00–09:00). Layla sells out early on weekends."],
          mapQuery: "Layla Bakery, 332 Portobello Road, London",
          sources: [{ label: "The Infatuation – Layla", url: "https://www.theinfatuation.com/london/reviews/layla-bakery" }, { label: "The Resident – best breakfasts in Notting Hill", url: "https://www.theresident.co.uk/food-and-drink/best-breakfasts-notting-hill-8952290" }],
        },
        {
          id: "d2-portobello", wiki: ["Portobello Road"], type: "walk", time: "09:45", endTime: "11:00",
          name: "Notting Hill & Portobello Road",
          area: "Notting Hill",
          teaser: "Pastel terraces, a famous blue door, Orwell’s old lodgings and the bookshop that inspired a film.",
          myNotes: ["Markets and bookshops, cute souvenirs."],
          light: "day",
          story: [
            "Notting Hill has reinvented itself more often than almost anywhere in London. In the 1820s it was pig farms and potteries; developers then built grand stucco crescents for a wealthy middle class who never quite came. By the 1950s many of those houses had been carved into overcrowded rooms let by slum landlords to new arrivals from the Caribbean. In 1958 the area saw race riots.",
            "The community’s answer became one of the world’s great street parties. Trinidadian activist Claudia Jones organised an indoor Caribbean carnival in 1959, and local social worker Rhaune Laslett organised a street festival in 1966. Together they are the roots of the Notting Hill Carnival, which now draws a million people every August.",
            "George Orwell rented a room at 22 Portobello Road in 1927, after quitting the Burma police, to start writing. Look for the blue plaque. And yes, the 1999 film: Hugh Grant’s travel bookshop was inspired by a real one on Blenheim Crescent, which still trades as <strong>The Notting Hill Bookshop</strong>. The famous blue front door was at 280 Westbourne Park Road. It’s someone’s home now, so be quick and quiet with photos.",
            "The candy-coloured houses are on Lancaster Road, Westbourne Park Road, Elgin Crescent and St Luke’s Mews. Locals painted them brightly when the area was poor and grey, and the colours stayed.",
          ],
          facts: [
            "The Electric Cinema at 191 Portobello Road was built in 1910 and is one of Britain’s oldest working cinemas. It has velvet armchairs and even beds in the front row.",
            "Alice’s at 86 Portobello Road, with its red-and-yellow shopfront, has sold antiques and curiosities for decades. It’s one of the most photographed shops in London.",
            "Books for Cooks on Blenheim Crescent is a cookbook-only bookshop with a test kitchen that cooks recipes from the books.",
            "Portobello on a Saturday is said to be the world’s largest antiques market, with over 1,000 dealers. Today is a Saturday, so you’ll see it at full strength.",
          ],
          lookFor: [
            "<strong>Orwell’s blue plaque</strong> at 22 Portobello Road.",
            "<strong>Alice’s shopfront</strong> (86 Portobello Road) and the pastel terraces either side.",
            "<strong>The Notting Hill Bookshop</strong> at 13 Blenheim Crescent. Its tote bags make a good small souvenir.",
          ],
          practical: {
            hours: "Saturday: the full market (about 09:00–19:00), including the antiques arcades (from about 08:00–09:00)",
            cost: "Free to wander",
            booking: "None",
            station: "Ladbroke Grove (top end) or Notting Hill Gate (bottom end)",
            allow: "75 min",
          },
          checks: ["Saturday market hours. Antiques dealers start early and some pack up mid-afternoon."],
          mapQuery: "Portobello Road, London",
          sources: [{ label: "Visit London – Portobello Road Market", url: "https://www.visitlondon.com/things-to-do/place/470049-notting-hill-and-portobello-road-market" }, { label: "Time Out – Portobello Road Market", url: "https://www.timeout.com/london/shopping/portobello-road-market-3" }, { label: "English Heritage blue plaques", url: "https://www.english-heritage.org.uk/visit/blue-plaques/" }],
        },
        {
          id: "d2-leg2", type: "travel", time: "10:35", mode: "tube", modeLabel: "Tube (Circle/District)",
          from: "Notting Hill Gate", to: "South Kensington",
          detail: "3 stops, about 10 min. Follow the signs for the museums’ pedestrian subway. It’s dry and brings you out next to the Natural History Museum.",
        },
        {
          id: "d2-nhm", wiki: ["Natural History Museum, London"], type: "sight", time: "11:00", endTime: "13:00",
          name: "Natural History Museum",
          area: "Cromwell Road, South Kensington",
          teaser: "A cathedral to nature, with a blue whale flying through the nave.",
          myNotes: ["Book free tickets."],
          free: true,
          booked: { summary: "Sat 5 Dec · 11:00 entry · 6 adults + 1 child", note: "Tickets were emailed; check the junk folder if they haven’t arrived." },
          story: [
            "By the 1850s the British Museum’s natural history collections, from Sir Hans Sloane’s pickled specimens to the treasures of Captain Cook’s voyages, had run out of room. Richard Owen, the anatomist who coined the word “dinosaur”, campaigned for a separate building: a “cathedral to nature” that ordinary people could walk into.",
            "Alfred Waterhouse designed it, and it opened in 1881. Look closely at the walls. They are clad in terracotta tiles moulded with hundreds of plants and animals, monkeys clambering up the arches and fish swimming round the columns. Owen and Waterhouse arranged them deliberately: <strong>living species on the west side, extinct ones on the east</strong>.",
            "For decades the great hall belonged to Dippy, a plaster cast of a <em>Diplodocus</em> given by Andrew Carnegie in 1905. In 2017 the museum swapped him for something real: <strong>Hope</strong>, the skeleton of a 25-metre blue whale. She stranded in Wexford Harbour, Ireland, in 1891, and the museum bought her for £250. She now dives from the ceiling of Hintze Hall, a reminder that a species hunted almost to extinction can recover.",
            "With two hours, do Hintze Hall, the Dinosaurs gallery with its moving T. rex, and then climb to the top floor for the slice of giant sequoia.",
          ],
          facts: [
            "The museum holds about 80 million specimens. Some were collected by Charles Darwin, whose marble statue sits on the main staircase.",
            "The giant sequoia slice on the top floor came from a tree that was over 1,300 years old when it was felled in 1891.",
            "The earthquake simulator in the Volcanoes and Earthquakes gallery recreates a Kobe supermarket during the 1995 earthquake.",
            "The ceiling of Hintze Hall is made of 162 painted panels of plants from around the world.",
            "In winter the museum’s front lawn usually becomes an ice rink. It’s paid and separate from the free museum.",
          ],
          lookFor: [
            "<strong>Hope’s baleen plates</strong>. Stand under her jaw: a blue whale’s tongue alone weighs as much as an elephant.",
            "<strong>The terracotta monkeys</strong> climbing the arches of Hintze Hall, living species to your left as you enter, extinct ones to your right.",
            "<strong>The sequoia’s rings</strong>, labelled with historical events such as the Norman Conquest.",
          ],
          practical: {
            hours: "Daily 10:00–17:50 (last entry 17:30)",
            cost: "Free. Some exhibitions and the ice rink are paid.",
            booking: "Booked: Sat 5 Dec, 11:00",
            station: "South Kensington (via the museum subway)",
            allow: "2 hours",
          },
          mapQuery: "Natural History Museum, Cromwell Road, London",
          sources: [{ label: "Natural History Museum – visit", url: "https://www.nhm.ac.uk/visit.html" }, { label: "NHM – Hope the blue whale", url: "https://www.nhm.ac.uk/discover/news/2017/july/hope-the-blue-whale-makes-a-splash.html" }],
        },
        {
          id: "d2-lunch", wiki: ["Wagamama", "Kensington High Street"], type: "food", time: "13:00",
          name: "Lunch: Wagamama Kensington",
          area: "Kensington High Street",
          teaser: "Steaming ramen bowls and katsu curry: warm, quick and filling.",
          myNotes: ["Budget £20–30."],
          food: {
            knownFor: "Wagamama opened its first restaurant in 1992 in a basement in Bloomsbury, near the British Museum. Long shared benches and food brought out the moment it’s ready made it a London institution.",
            order: "Chicken katsu curry (the signature), or a chilli chicken ramen to warm up. Add gyoza to share.",
            price: "£15–25 with a drink",
            alternatives: "<strong>V&amp;A Café</strong>, inside the V&amp;A and next door to the NHM: hot meals and cakes in the gorgeous Victorian Morris, Gamble and Poynter rooms. It saves the 40-minute round trip.",
          },
          alerts: [{ level: "minor", title: "About 20 minutes’ walk each way", html: "<p>Kensington High Street is about 1.5 km west of the museums. To be at the V&amp;A by 14:30, leave Wagamama by about 14:05. Or take the Circle/District one stop from High Street Kensington to Gloucester Road and walk 10 min.</p>" }],
          story: ["Kensington High Street is Kensington Palace’s local high street. The palace, where Queen Victoria was born and grew up, is just north through Kensington Gardens. Victoria was woken there on 20 June 1837 to be told she was queen."],
          checks: ["Which Wagamama you mean. The Kensington branch is on Kensington High Street, about 20 min from the museums."],
          mapQuery: "Wagamama Kensington High Street, London",
          sources: [{ label: "Wagamama – restaurants", url: "https://www.wagamama.com/restaurants" }],
        },
        {
          id: "d2-va", wiki: ["Victoria and Albert Museum"], type: "sight", time: "14:30", endTime: "16:00",
          name: "V&A (Victoria and Albert Museum)",
          area: "Cromwell Road, South Kensington",
          teaser: "The world’s greatest museum of art and design, with a detachable fig leaf.",
          myNotes: ["Book free tickets."],
          free: true,
          book: { what: "V&A – free ticket for Sat 5 Dec ~14:30 (optional; the V&A says general admission needs no booking)", when: "optional", link: "https://www.vam.ac.uk/info/plan-your-visit", priority: "recommended" },
          story: [
            "The Great Exhibition of 1851 made a profit, and Prince Albert had a plan for it: buy land in South Kensington and build an estate of museums and colleges to make British design the best in the world. The V&A began as the Museum of Manufactures, full of objects meant to teach factory designers good taste. It moved here in 1857, and Queen Victoria renamed it in 1899 when she laid the foundation stone of the grand front.",
            "From the start it was meant for working people. It was the first museum in the world to have gas lighting, so it could open in the evenings after the factories closed, and the first to have a refreshment room. That café still serves lunch in its original Victorian rooms, one of them decorated by William Morris’s young firm.",
            "Today there are more than two million objects, from Tipu’s Tiger, a life-size wooden automaton of a tiger mauling a British soldier made for Tipu Sultan of Mysore, to Alexander McQueen. The Cast Courts hold full-size plaster copies of Europe’s great monuments, including Trajan’s Column, so tall it had to be cast in two halves. Michelangelo’s David is here too. When Queen Victoria visited, a plaster fig leaf was made and hung on him for modesty.",
          ],
          facts: [
            "The fig leaf made for David is displayed in a case behind the statue.",
            "Tipu’s Tiger has a small organ inside. Turn the handle and the tiger growls and the soldier wails. It was taken by the British when Seringapatam fell in 1799, and its history is now told as part of the story of empire and looting.",
            "The Great Bed of Ware, about 3.3 m wide, was already a tourist attraction in Shakespeare’s day; he mentions it in <em>Twelfth Night</em>. Visitors carved their initials into it.",
            "The huge blue-and-green glass chandelier in the entrance rotunda is by Dale Chihuly (2001).",
            "Raphael’s tapestry designs, the Raphael Cartoons, have been in the royal collection since 1623 and hang here on loan from the King.",
          ],
          lookFor: [
            "<strong>The bomb scars</strong> on the Exhibition Road façade. Shrapnel damage from the Blitz was left unrepaired on purpose, with an inscription explaining why.",
            "<strong>Tipu’s Tiger</strong> in the South Asia galleries.",
            "<strong>The V&amp;A Café’s Morris Room</strong>. Even if you don’t eat here, peek in at the green walls and stained glass.",
          ],
          practical: {
            hours: "Daily 10:00–17:30 (later on Fridays)",
            cost: "Free. Some exhibitions are paid.",
            booking: "Not required for general admission; booking a free ticket is optional",
            station: "South Kensington",
            allow: "1½ hours",
          },
          checks: ["V&A closing time: the official page shows 17:30, while some guides say 17:45. Either way it’s fine for your 16:00 exit."],
          mapQuery: "Victoria and Albert Museum, Cromwell Road, London",
          sources: [{ label: "V&A – plan your visit", url: "https://www.vam.ac.uk/info/plan-your-visit" }, { label: "V&A – Tipu’s Tiger", url: "https://www.vam.ac.uk/articles/tipus-tiger" }, { label: "V&A – the fig leaf", url: "https://www.vam.ac.uk/articles/david-and-the-fig-leaf" }],
        },
        {
          id: "d2-harrods", wiki: ["Harrods"], type: "sight", time: "16:15",
          name: "Harrods & Oxford Street",
          area: "Knightsbridge, then the West End",
          teaser: "The shop that once sold a lion cub, then London’s Christmas lights and Selfridges’ windows.",
          myNotes: ["Shopping for whoever wants."],
          light: "night",
          alerts: [{ level: "minor", title: "Saturday: late opening, big crowds", html: "<p>On a Saturday Harrods and Oxford Street’s big shops stay open into the evening (usually until 20:00–21:00), so you have time for both before the Southbank. From Harrods to Oxford Circus is about 15–20 min (Piccadilly line to Green Park, then the Victoria line).</p>" }],
          story: [
            "In 1849 Charles Henry Harrod, a tea merchant, took over a small grocer’s shop in what was then the village of Knightsbridge. His son grew it into a department store. When it burned down in December 1883, he still delivered every Christmas order on time, and the publicity made the shop’s name.",
            "In 1898 Harrods installed Britain’s first moving staircase, really a woven leather conveyor belt. Nervous customers were offered brandy and smelling salts at the top. The store’s motto is <em>Omnia Omnibus Ubique</em>, “all things for all people, everywhere”, and it meant it. The pet department famously sold exotic animals. In 1969 two young Australians bought a lion cub there, named him Christian, and raised him in a London flat before releasing him in Kenya. Footage of their tearful reunion a year later became one of the internet’s most-watched animal videos.",
            "Oxford Street has been London’s high street for a century. Harry Gordon Selfridge, an American, opened his palace of a shop in 1909, encouraged customers to browse just for fun, and made shop windows into theatre. The Christmas windows and the Oxford Street lights, a tradition since 1959, are best seen after dark, which in December means from about 16:30.",
          ],
          facts: [
            "Harrods’ food halls are decorated with tiles made by Royal Doulton in 1902.",
            "Harrods covers about 1 million square feet and has around 330 departments.",
            "Selfridges is often credited with popularising “the customer is always right”.",
            "Oxford Street follows the line of a Roman road, and was once the route condemned prisoners took to the gallows at Tyburn, now Marble Arch.",
          ],
          lookFor: [
            "<strong>The Egyptian Escalator</strong> in Harrods, lined with pharaohs and hieroglyphs.",
            "<strong>Selfridges’ Christmas windows</strong> on Oxford Street.",
          ],
          practical: {
            hours: "Saturday: Harrods usually 10:00–21:00; Oxford Street shops about 09:00/10:00–21:00",
            cost: "Free to browse",
            booking: "None",
            station: "Knightsbridge (Harrods). Oxford Circus or Bond Street (Oxford St).",
            allow: "1½ hours",
          },
          checks: ["Harrods and Oxford Street Saturday hours in December. Festive late openings vary."],
          mapQuery: "Harrods, Brompton Road, London",
          sources: [{ label: "Harrods – plan your visit", url: "https://www.harrods.com/en-gb/c/plan-your-visit" }, { label: "Selfridges – history", url: "https://www.selfridges.com/GB/en/features/info/our-heritage/" }],
        },
        {
          id: "d2-leg3", type: "travel", mode: "tube", modeLabel: "Tube + walk",
          from: "Oxford Circus", to: "Embankment → Southbank",
          detail: "Bakerloo line from Oxford Circus to Embankment (4 stops), then walk over the Golden Jubilee footbridge. It has one of the best night views in London: Parliament upstream, St Paul’s downstream.",
        },
        {
          id: "d2-southbank", wiki: ["Southbank Centre"], type: "sight", when: "Evening",
          name: "Southbank Centre Winter Market",
          area: "Queen’s Walk, under Hungerford Bridge",
          teaser: "Wooden chalets, mulled wine and the Thames glittering below the London Eye.",
          light: "night", free: true,
          story: [
            "In 1951, six years after the war, Britain threw itself a party. The Festival of Britain filled this bombed-out stretch of riverbank with futuristic pavilions, a cigar-shaped tower that seemed to float, and the Dome of Discovery, all meant to show a battered nation a brighter future. When the festival closed, the new government demolished almost everything. Only one building was kept: the <strong>Royal Festival Hall</strong>, which became the first post-war building in England to be listed Grade I.",
            "The concrete arts centre that grew around it, the Hayward Gallery, Queen Elizabeth Hall and National Theatre, is brutalism at its boldest. People either love it or hate it. Its covered undercroft became a skateboarding spot in the 1970s. When developers wanted to turn it into shops in 2013, skaters and fans ran the Long Live Southbank campaign and won, so the skaters are still there.",
            "In winter, wooden chalets line the river walk for the Winter Market: food stalls, hot chocolate, mulled wine, gifts and bars, with the lit-up London Eye towering overhead and Parliament across the water.",
          ],
          facts: [
            "The 2026–27 Winter Market runs Mon 2 Nov 2026 to Sun 3 Jan 2027. Stalls open 11:00–22:00, bars until 23:00. Free entry.",
            "The London Eye was meant to stand for five years from 2000. It never came down.",
            "There’s a second-hand book market under Waterloo Bridge, a few minutes along the river, that trades most days. It’s great for cheap souvenirs.",
            "Cleopatra’s Needle, the 3,500-year-old Egyptian obelisk on the opposite bank, has a time capsule from 1878 buried under it. It holds newspapers, a railway guide and photographs of “the twelve most beautiful Englishwomen”.",
          ],
          lookFor: [
            "<strong>The skate undercroft</strong> beneath Queen Elizabeth Hall, covered in layers of graffiti.",
            "<strong>Parliament from the riverside</strong>, lit gold after dark, upstream past the Eye.",
          ],
          practical: {
            hours: "Stalls 11:00–22:00, bars 11:00–23:00 (2 Nov 2026 – 3 Jan 2027; closed 25 and 31 Dec)",
            cost: "Free entry. Mulled wine or hot chocolate about £5–8, street food £8–14.",
            booking: "None",
            station: "Embankment (walk the footbridge) or Waterloo",
            allow: "1–2 hours",
          },
          mapQuery: "Southbank Centre Winter Market, Queen's Walk, London",
          sources: [{ label: "Southbank Centre – Winter Market", url: "https://www.southbankcentre.co.uk/activity/winter-market/" }, { label: "Southbank Centre – history", url: "https://www.southbankcentre.co.uk/about/history" }],
        },
      ],
    },
    /* ============================== DAY 3 ============================== */
    {
      title: "Bankside, St Paul’s, the river & East London",
      line: { name: "River line", colour: "#0b6e8e" },   // this day’s colour on the trip map
      neighbourhoods: ["Borough", "Bankside", "City of London", "Canary Wharf", "Whitechapel", "Brick Lane", "Shoreditch"],
      nutshell: "Shakespeare’s South Bank: a centuries-old food market, a rebuilt Elizabethan playhouse and a power station turned art palace. After lunch you cross the wobbly bridge to Wren’s dome, ride the river east to the glass towers of Docklands, and end with salt-beef beigels on Brick Lane.",
      alerts: [
        {
          level: "clash",
          title: "St Paul’s is closed to sightseers on Sundays",
          html: "<p>Day 3 is <strong>Sun 6 Dec</strong>. On Sundays St Paul’s is open only for worship, so there are no tickets, no galleries and no crypt. (Your planned 30 minutes would have been too short anyway; a visit needs about 1½ hours.) Options:</p><ul><li><strong>Today:</strong> keep the Millennium Bridge, the outside of the cathedral and the One New Change escalator as planned. Or stay for the free <strong>Choral Evensong at 15:00</strong> (about 45 min, choir included, arrive by 14:40). You see the inside from your seat, then catch a later boat at about 16:00.</li><li><strong>Recommended:</strong> do the full visit on <strong>Day 4 (Mon 7 Dec)</strong>, in your 1-hour City gap. See the Day 4 notes.</li></ul>",
        },
        {
          level: "minor",
          title: "Borough Market: Sunday hours",
          html: "<p>On Sundays Borough Market’s stalls open at <strong>10:00</strong> and close at about <strong>16:00</strong>, so 09:00 breakfast is early. Have coffee and a pastry at a café on the market’s edge, or walk round Southwark Cathedral’s churchyard; the cathedral is busy with morning services. Lunch at 13:00 is fine. Also on Sunday: the Uber Boat charges peak fares all day, and Brick Lane’s Sunday markets are on but pack up at about 17:00–18:00.</p>",
        },
      ],
      items: [
        {
          id: "d3-leg1", type: "travel", time: "08:00", mode: "train", modeLabel: "Thameslink",
          from: "Mill Hill Broadway", to: "London Bridge",
          detail: "Many Thameslink trains (Brighton/Gatwick-bound) run straight through to London Bridge in about 35–40 min. If yours terminates at Blackfriars, it’s a 15-min riverside walk.",
        },
        {
          id: "d3-breakfast", wiki: ["Borough Market"], type: "food", time: "09:00",
          name: "Breakfast & coffee at Borough Market",
          area: "Southwark, by London Bridge",
          teaser: "London’s larder for 1,000 years: coffee, pastries and the smell of roasting chestnuts.",
          food: {
            knownFor: "Specialist British and international produce: cheese, bread, game, oysters, chocolate and dozens of hot-food traders.",
            order: "A flat white from <strong>Monmouth Coffee</strong> (Park Street, opens early, long but fast queue), then a custard or seasonal doughnut from <strong>Bread Ahead</strong> once stalls open at 10:00.",
            price: "£5–10",
            alternatives: "Southwark Cathedral’s café, or one of the Bankside cafés if the market is still shuttered.",
          },
          story: ["There has been a market on or near this spot since at least the 12th century, and possibly much earlier, serving travellers coming over London Bridge, for centuries the only bridge across the Thames. It was so congested that in 1755 the City got an Act of Parliament to close it. The parishioners of Southwark then bought a patch of land, the “Triangle”, and reopened it themselves in 1756. It’s still run by a charitable trust."],
          checks: ["Sunday hours: 10:00–16:00 per the market’s own site (December can differ). Check that Monmouth Coffee or another café is open on Sunday morning before 10:00."],
          mapQuery: "Borough Market, London",
          sources: [{ label: "Borough Market – opening times", url: "https://boroughmarket.org.uk/" }, { label: "Borough Market – history", url: "https://boroughmarket.org.uk/the-market/history" }],
        },
        {
          id: "d3-globe", wiki: ["Shakespeare's Globe"], type: "sight", time: "10:00",
          name: "Shakespeare’s Globe",
          area: "Bankside",
          teaser: "A thatched Elizabethan playhouse, rebuilt 200 metres from the original by an American actor who wouldn’t take no for an answer.",
          book: { what: "Shakespeare’s Globe – guided tour, Sun 6 Dec ~10:00", when: "check December tour times, then book", link: "https://www.shakespearesglobe.com/", priority: "recommended" },
          story: [
            "On a freezing night in December 1598, a gang of carpenters went to a theatre in Shoreditch, called simply The Theatre, and pulled it down. The Burbage family, who ran Shakespeare’s company, owned the building but not the land, and their landlord was threatening to keep it. They stored the timbers, then carried them across the river and used them to build a new playhouse on Bankside. They called it the Globe.",
            "Many of Shakespeare’s greatest plays, probably including <em>Hamlet</em>, <em>Othello</em> and <em>King Lear</em>, were first staged here. Standing “groundlings” paid a penny to crowd round the stage, and nutshells and oyster shells have been found in the soil. In 1613 a cannon fired during <em>Henry VIII</em> set the thatch alight and the theatre burned to the ground in an hour. The only casualty was a man whose breeches caught fire; someone put him out with a bottle of ale. It was rebuilt, then closed by the Puritans in 1642.",
            "Three centuries later, the American actor <strong>Sam Wanamaker</strong> came looking for the Globe and found only a plaque on a brewery wall. He spent over 20 years raising money and fighting planners to rebuild it, using green oak, lime plaster and wooden pegs. He died in 1993, four years before it opened in 1997.",
          ],
          facts: [
            "The Globe’s thatched roof was the first allowed in London since the Great Fire of 1666. It needed special permission and is laced with modern fire protection.",
            "The original Globe’s foundations were rediscovered in 1989 under Anchor Terrace on Park Street, about 200 m away.",
            "Like the original, the new Globe is open to the sky. If it rains, groundlings get wet; umbrellas aren’t allowed because they block the view.",
            "Next door, the Sam Wanamaker Playhouse is lit entirely by beeswax candles. December is its season for candlelit winter plays.",
            "Shakespeare’s company were “the Lord Chamberlain’s Men”, and then, after James I became their patron in 1603, “the King’s Men”.",
          ],
          lookFor: [
            "<strong>The painted “heavens”</strong> over the stage, the ceiling of stars and zodiac signs from which gods descended.",
            "<strong>The “marble” pillars</strong> on stage. They’re painted wood, the Elizabethans’ trick for looking expensive.",
            "<strong>The Globe’s gates on Bankside</strong>, wrought iron decorated with creatures and plants from Shakespeare’s plays.",
          ],
          practical: {
            hours: "Tours usually run daily from about 09:30–10:00, but times change around performances in winter",
            cost: "Guided tour about £25–27 (adult); ask about concessions",
            booking: "Recommended. Book a timed tour online.",
            station: "London Bridge, Blackfriars or Southwark (10 min walk)",
            allow: "50–60 min (tour plus a short exhibition)",
          },
          checks: ["December 2026 tour times and prices on shakespearesglobe.com. Winter tours can be limited by rehearsals and matinées. An older listing showed tours Tue–Sat only in Nov–Dec, which would rule out Sunday."],
          mapQuery: "Shakespeare's Globe, 21 New Globe Walk, London",
          sources: [{ label: "Shakespeare’s Globe", url: "https://www.shakespearesglobe.com/" }, { label: "Shakespeare’s Globe – history", url: "https://www.shakespearesglobe.com/discover/about-us/history-of-the-globe/" }],
        },
        {
          id: "d3-tate", wiki: ["Tate Modern"], type: "sight", time: "11:30",
          name: "Tate Modern",
          area: "Bankside",
          teaser: "A power station built to light London, rebuilt to show the world’s most exciting art. Free.",
          free: true,
          story: [
            "Bankside Power Station was designed by Sir Giles Gilbert Scott, the man who also gave Britain the red telephone box. It burned oil to light the capital from the 1950s until 1981, then stood empty and rusting opposite St Paul’s for nearly 20 years.",
            "In 1994 the Tate gallery chose it for a new museum of modern art. The Swiss architects Herzog &amp; de Meuron kept the brick shell and turned the cavernous Turbine Hall, where the generators had stood, into a vast indoor street. It now hosts one giant commission each year. Tate Modern opened in May 2000 and quickly became one of the most visited modern art museums in the world.",
            "Scott kept the central chimney at 99 metres on purpose, a little lower than the dome of St Paul’s across the river, so the power station would never outrank the cathedral.",
            "Inside, the free collection runs from Picasso, Matisse and Dalí to Rothko, Warhol and Louise Bourgeois. The Rothko room’s dark, glowing Seagram murals were painted for a New York restaurant. Rothko changed his mind about them and gave them to the Tate. They arrived in London the day he died, in 1970.",
          ],
          facts: [
            "The Turbine Hall is about 155 m long, big enough for a commissioned artwork to fill it. Olafur Eliasson put a giant artificial sun in it in 2003, and visitors lay on the floor to look up.",
            "The Blavatnik Building, the twisted brick pyramid at the back, opened in 2016. Its brick is laid in a lattice so light glows through it at night.",
            "The museum still contains a working electricity substation owned by UK Power Networks.",
            "Entry to the collection is free. Only special exhibitions charge.",
          ],
          lookFor: [
            "<strong>The view of St Paul’s</strong> from the Level 4 or Level 10 windows: the Millennium Bridge lines up on the dome.",
            "<strong>The Rothko room</strong> in the Natalie Bell Building. Sit for five minutes and let your eyes adjust.",
          ],
          practical: {
            hours: "Daily 10:00–18:00",
            cost: "Free (exhibitions charge; ask about concessions)",
            booking: "Not needed for the collection",
            station: "Southwark or Blackfriars",
            allow: "1–1½ hours",
          },
          checks: ["Level 10 viewing terrace: part has been restricted since a 2023 Supreme Court privacy ruling over views into neighbouring flats. Check what’s open on the day."],
          mapQuery: "Tate Modern, Bankside, London",
          sources: [{ label: "Tate Modern – visit", url: "https://www.tate.org.uk/visit/tate-modern" }, { label: "Tate – history of Bankside Power Station", url: "https://www.tate.org.uk/about-us/projects/transforming-tate-modern/history-tate-modern" }],
        },
        {
          id: "d3-lunch", wiki: ["Southwark Cathedral", "Borough Market"], type: "food", time: "13:00",
          name: "Lunch at Borough Market",
          area: "Borough Market",
          teaser: "Graze your way round the stalls: raclette, toasties, curries and the best doughnut in London.",
          suggestedTime: "12:45", suggestedWhy: "gives you time for St Paul’s inside",
          food: {
            knownFor: "Dozens of hot-food traders, from Ethiopian stews to Spanish paella, plus the famous cheese toastie and raclette stalls.",
            order: "The <strong>Kappacasein</strong> cheese toastie or raclette (melted cheese scraped over potatoes), a sausage roll from <strong>The Ginger Pig</strong>, and a doughnut from <strong>Bread Ahead</strong>.",
            price: "£8–15",
            alternatives: "<strong>Padella</strong> (fresh pasta at good prices) round the corner, but expect a queue.",
          },
          story: ["Film fans will recognise Stoney Street: it played the outside of the Leaky Cauldron in <em>Harry Potter and the Prisoner of Azkaban</em>. Bridget Jones’s flat was above The Globe pub on Bedale Street, opposite the market."],
          facts: [
            "The Market Porter pub has a special licence to open early in the morning for market workers, a tradition from the days when porters started at dawn.",
            "Southwark Cathedral, next door, is where Shakespeare’s brother Edmund, an actor, is buried. There’s a memorial to Shakespeare inside.",
          ],
          mapQuery: "Borough Market, London",
          sources: [{ label: "Borough Market – traders", url: "https://boroughmarket.org.uk/traders" }],
        },
        {
          id: "d3-stpauls", wiki: ["St Paul's Cathedral"], type: "sight", time: "14:30", endTime: "15:00",
          name: "Millennium Bridge & St Paul’s Cathedral",
          area: "Bankside → City of London",
          teaser: "The bridge that wobbled, Wren’s dome that survived the Blitz, and the escalator with the best view in London.",
          myNotes: ["Remember to go to the escalators: the One New Change escalator that rises to reveal the dome."],
          light: "day", free: true,
          alerts: [{ level: "clash", title: "Sunday: no sightseeing inside", html: "<p>Today, cross the bridge, walk round the outside and ride the One New Change escalator. Optionally attend the free Choral Evensong at 15:00. For the full visit (dome galleries, crypt) go on <strong>Mon 7 Dec</strong>: see Day 4.</p>" }],
          story: [
            "The Millennium Bridge opened on 10 June 2000, the first new Thames crossing in central London for over a century. Two days later it closed. As crowds walked across, the bridge swayed slightly, the walkers fell into step to keep their balance, and that made it sway more. It took two years and dozens of shock absorbers to cure the “wobbly bridge”.",
            "Walk across and Wren’s dome fills the view. There have been cathedrals dedicated to St Paul here since 604. The fourth, Old St Paul’s, was one of the largest churches in Europe until the Great Fire of 1666 burned it to a shell. Christopher Wren, an astronomer turned architect, spent 35 years on its replacement, from the first stone in 1675 until it was declared complete in 1711. When he started setting out the site, a workman fetched an old gravestone to mark the centre. It happened to carry one word: <em>Resurgam</em>, “I shall rise again”.",
            "On the night of 29 December 1940, firebombs rained on the City. Churchill sent word that St Paul’s must be saved at all costs, and volunteer fire-watchers fought the flames on the roof. A photograph of the dome standing unharmed through the smoke became the symbol of London’s survival.",
            "After the cathedral, walk round to <strong>One New Change</strong>, the shopping centre just east, and ride the escalator up from the lower level. The dome slides into view at the top.",
          ],
          facts: [
            "The dome is really three domes: an inner one you see from inside, a hidden brick cone that carries the weight, and the outer lead-covered dome that crowns the skyline.",
            "It’s 259 steps to the Whispering Gallery, where a whisper against the wall carries round to the other side, 376 to the Stone Gallery and 528 to the Golden Gallery at the top.",
            "Wren is buried in the crypt under a plain slab. His epitaph reads <em>Lector, si monumentum requiris, circumspice</em>: “Reader, if you seek his monument, look around you”.",
            "Nelson’s black sarcophagus in the crypt was originally made for Cardinal Wolsey, confiscated by Henry VIII, and stored unused for nearly 300 years.",
            "Look down on the Millennium Bridge: the artist Ben Wilson has painted hundreds of tiny pictures on flattened chewing gum stuck to its deck.",
          ],
          lookFor: [
            "<strong>The phoenix and “RESURGAM”</strong> carved over the south door, Wren’s nod to the gravestone.",
            "<strong>Ben Wilson’s chewing-gum paintings</strong> on the Millennium Bridge. Look down; they’re coin-sized.",
            "<strong>The One New Change escalator reveal</strong> of the dome (and the free rooftop terrace, if it’s open).",
          ],
          practical: {
            hours: "Today (Sunday): worship only. Choral Evensong 15:00 (free, about 45 min). Sightseeing Mon–Sat from 08:30, last entry 16:00.",
            cost: "About £24–27 adult. Concession/student about £23.50–24 with ID. Cheaper online than at the door. Includes the dome galleries and multimedia guide.",
            booking: "None for today’s services. For a Monday visit, book online (cheaper).",
            station: "St Paul’s (Central line), or Blackfriars or Mansion House",
            allow: "Today 20–30 min (bridge, exterior, escalator), or about 1 h with Evensong",
          },
          checks: ["Sunday 6 Dec service times (Choral Evensong normally 15:00) on stpauls.co.uk. December carol services can change the timetable.", "The One New Change rooftop terrace has been closed at times; the escalator is in the public mall."],
          mapQuery: "St Paul's Cathedral, London",
          sources: [{ label: "St Paul’s Cathedral – visit", url: "https://www.stpauls.co.uk/visit-us" }, { label: "St Paul’s – history", url: "https://www.stpauls.co.uk/history-collections" }, { label: "Arup – Millennium Bridge", url: "https://www.arup.com/projects/millennium-bridge" }],
        },
        {
          id: "d3-leg-boat", type: "travel", time: "15:45", mode: "boat", modeLabel: "Uber Boat by Thames Clippers",
          from: "Blackfriars Pier (or Bankside Pier)", to: "Canary Wharf Pier",
          detail: "Tap a contactless card at the pier reader (not capped). About 25–35 min, a boat every 10–20 min. Sit outside at the back for Tower Bridge passing overhead. On Sundays the peak fare applies all day, roughly £13–14 one-way; Travelcard holders get a third off.",
        },
        {
          id: "d3-canary", wiki: ["Canary Wharf"], type: "sight", time: "16:00",
          name: "Canary Wharf",
          area: "Isle of Dogs, Docklands",
          teaser: "From the world’s busiest docks to a forest of glass towers, with a roof garden planted by latitude.",
          suggestedTime: "16:15", suggestedWhy: "after the boat",
          light: "night",
          story: [
            "In 1802 the West India Docks opened here: vast walled basins where ships unloaded sugar, rum and coffee from the Caribbean, guarded against the river’s notorious thieves. That wealth was built on the labour of enslaved people, which the free <strong>London Museum Docklands</strong> (formerly the Museum of London Docklands), in an 1802 sugar warehouse on the quay, tells unflinchingly.",
            "The name comes later. In the 1930s a shipping company, Fruit Lines Ltd, used a berth here for tomatoes and bananas from the Canary Islands, and the warehouse became “Canary Wharf”. By 1980 container ships had made the old docks obsolete, and they closed, leaving miles of empty water and warehouses.",
            "Then came one of Europe’s biggest building projects. <strong>One Canada Square</strong>, the stainless-steel tower with the pyramid top, was Britain’s tallest building from 1990 until the Shard overtook it. Its pyramid sometimes seems to puff smoke; that’s steam from the vents. Today about 100,000 people work here.",
            "After dark the towers glitter over the old dock water. Head up to the <strong>Crossrail Place Roof Garden</strong> above the Elizabeth line station, a free garden under a timber lattice roof. Because Canary Wharf sits close to the Prime Meridian, the plants are arranged by hemisphere: those from the Americas on the west side, Asia and Australasia on the east.",
          ],
          facts: [
            "London Museum Docklands is free and usually open daily 10:00–17:00, a good warm hour if you arrive early.",
            "Canary Wharf’s ice rink, a Christmas fixture for years, is reported not to be returning in 2026.",
            "The Elizabeth line station under the roof garden was built inside the drained dock, below the waterline.",
            "Canary Wharf has one of the largest collections of public art in the UK, with over 100 works scattered across the estate.",
          ],
          lookFor: [
            "<strong>The roof garden’s meridian split</strong>: western-hemisphere plants on one side, eastern on the other.",
            "<strong>The old dock cranes and warehouses</strong> on West India Quay, beside the Docklands museum.",
          ],
          practical: {
            hours: "Roof garden usually open daily until about 21:00. Docklands museum about 10:00–17:00.",
            cost: "Free",
            booking: "None",
            station: "Canary Wharf (Jubilee / Elizabeth line / DLR)",
            allow: "1 hour",
          },
          checks: ["Canary Wharf’s 2026 winter events (ice rink reportedly cancelled), and London Museum Docklands hours."],
          mapQuery: "Crossrail Place Roof Garden, Canary Wharf",
          sources: [{ label: "Canary Wharf – Crossrail Place Roof Garden", url: "https://canarywharf.com/" }, { label: "London Museum Docklands", url: "https://www.londonmuseum.org.uk/docklands/" }, { label: "Time Out – Canary Wharf ice rink not returning", url: "https://www.timeout.com/london/news/canary-wharf-ice-rink-cancelled-this-year-100826" }],
        },
        {
          id: "d3-leg2", type: "travel", mode: "elizabeth", modeLabel: "Elizabeth line",
          from: "Canary Wharf", to: "Whitechapel",
          detail: "One stop, about 4 min. Then it’s a 10-min walk up to the bottom of Brick Lane. The walk ends at Shoreditch High Street for the trip home.",
        },
        {
          id: "d3-shoreditch", wiki: ["Brick Lane"], type: "walk", when: "Evening",
          name: "Brick Lane & Shoreditch",
          area: "Spitalfields, Brick Lane, Shoreditch",
          teaser: "One building that was a church, a synagogue and a mosque, and the street where Shakespeare’s career began.",
          light: "night",
          story: [
            "Brick Lane is London’s great arrivals hall. In the late 1600s Huguenots, Protestant refugees from France, settled here and turned Spitalfields into a silk-weaving quarter; you can still see the wide attic windows that let light onto their looms. Irish weavers followed, then, from the 1880s, tens of thousands of Jewish families escaping persecution in Eastern Europe. Since the 1970s the street has been the heart of London’s Bangladeshi community, and its street signs are in Bengali too.",
            "One building tells the whole story. At the corner of Fournier Street, the <strong>Brick Lane Jamme Masjid</strong> was built in 1743 as a Huguenot chapel. It became a Methodist chapel, then in 1898 the Great Synagogue, and since 1976 it has been a mosque. High on its wall is a sundial with the Latin motto <em>Umbra sumus</em>: “we are shadows”.",
            "Walk north into Shoreditch and you reach the birthplace of the London theatre. In 1576 James Burbage built The Theatre here, the first purpose-built playhouse of its kind. Shakespeare acted here. Its timbers became the Globe you saw this morning, so the day’s story comes full circle. Today Shoreditch is street art, bars and the shipping-container shops of Boxpark.",
          ],
          facts: [
            "The remains of both The Theatre and the nearby Curtain playhouse have been excavated. The Curtain is where <em>Henry V</em> may have premiered, with its “wooden O”.",
            "Look for Stik’s stick figures and Ben Eine’s giant painted letters on shop shutters around the area.",
            "The Old Truman Brewery, once one of the largest breweries in the world, is now markets, shops and studios.",
            "Many Brick Lane curry houses are run by families from Sylhet in Bangladesh.",
          ],
          lookFor: [
            "<strong>The sundial</strong> on the Jamme Masjid, corner of Brick Lane and Fournier Street: “Umbra sumus”.",
            "<strong>The weavers’ attic windows</strong> on Fournier Street’s 1720s houses.",
            "<strong>Bengali street signs</strong> along Brick Lane.",
          ],
          practical: {
            hours: "Streets any time. Sunday is market day: Sunday Upmarket and Brick Lane market until about 17:00–18:00. Bars until late.",
            cost: "Free",
            booking: "None",
            station: "Whitechapel or Aldgate East (south end), Shoreditch High Street (north end)",
            allow: "1–1½ hours",
          },
          mapQuery: "Brick Lane Jamme Masjid, 59 Brick Lane, London",
          sources: [{ label: "Survey of London – Brick Lane & Spitalfields", url: "https://www.british-history.ac.uk/survey-london/vol27" }, { label: "MOLA – The Theatre, Shoreditch", url: "https://www.mola.org.uk/" }],
        },
        {
          id: "d3-beigel", wiki: ["Beigel Bake", "Brick Lane"], type: "food", when: "Evening",
          name: "Beigel Bake",
          area: "159 Brick Lane",
          teaser: "Hot salt-beef beigels, 24 hours a day, at East End prices.",
          myNotes: ["Visit Beigel Bake for snacks."],
          light: "night",
          food: {
            knownFor: "Open around the clock, every day. A survivor of the Jewish East End, famous for hand-carved hot salt beef and boiled-then-baked beigels (the East End spelling).",
            order: "Salt beef beigel with English mustard (and a gherkin if you’re brave). A cream cheese beigel for a cheap snack. A cinnamon bun or rugelach for the Tube.",
            price: "Plain beigels about £1 or less. Salt beef about £8–10. Cash and card.",
            alternatives: "The yellow-signed Beigel Shop two doors down is the long-standing rival. Locals argue about which is better.",
          },
          story: ["Look for the white sign; Beigel Bake is the one with the queue. The counter staff carve the salt beef by hand from huge joints kept hot behind the glass, and the queue moves fast, so know your order. At 2am it’s full of taxi drivers, clubbers and night-shift workers, a slice of the East End that never closes."],
          checks: ["Prices rise often. Salt beef was about £7–9 in 2025, so check the board."],
          mapQuery: "Beigel Bake, 159 Brick Lane, London",
          sources: [{ label: "Time Out – Beigel Bake", url: "https://www.timeout.com/london/restaurants/beigel-bake" }],
        },
      ],
    },

    /* ============================== DAY 4 ============================== */
    {
      title: "Bloomsbury, the City & A Christmas Carol",
      line: { name: "Dickens line", colour: "#6950a1" },   // this day’s colour on the trip map
      neighbourhoods: ["Bloomsbury", "Covent Garden", "City of London", "Tower Hill", "Waterloo"],
      nutshell: "Bloomsbury’s literary squares and the British Museum’s treasures fill the morning. In the afternoon you walk the old Roman City, from Diagon Alley’s Victorian market to the Gherkin, and reach Tower Bridge as the lights come on. The day ends where Dickens would want it: at the Old Vic, watching Scrooge discover Christmas.",
      alerts: [
        {
          level: "minor",
          title: "Use the City gap for St Paul’s (closed to sightseers yesterday)",
          html: "<p>Leadenhall ends at 14:15 and the Gherkin is planned for 15:15, leaving an hour spare. Since St Paul’s was closed for sightseeing on Sunday, slot it in here:</p><ol><li>12:30–13:15 Five Guys</li><li>13:15 Central line Holborn → St Paul’s (2 stops)</li><li><strong>13:30–14:45 St Paul’s Cathedral</strong></li><li>14:45 walk east (15 min)</li><li>15:00–15:25 Leadenhall Market</li><li>15:25–15:40 the Gherkin</li><li>15:40–16:15 walk to Tower Bridge, as planned</li></ol><p><strong>Not Sky Garden:</strong> Mon 7 Dec is the first Monday of the month, when Sky Garden normally closes for maintenance until 18:00. Without St Paul’s, <strong>the Monument</strong> (311 steps up Wren’s column to the Great Fire, small fee, certificate) is the other filler.</p>",
        },
        {
          level: "minor",
          title: "Short hops",
          html: "<ul><li><strong>British Museum entry is booked for 10:20</strong>, not 10:00. Take your time over coffee.</li><li><strong>Covent Garden → Leadenhall</strong> takes 25–30 min (Piccadilly line to Holborn, Central line to Bank). Leave Five Guys by 13:15.</li><li><strong>Tower Bridge → Waterloo</strong> takes about 25 min (walk to London Bridge, then the Jubilee line 2 stops). 17:00 is fine if you leave at 16:45.</li></ul>",
        },
      ],
      items: [
        {
          id: "d4-leg1", type: "travel", time: "08:00", mode: "train", modeLabel: "Thameslink + walk",
          from: "Mill Hill Broadway", to: "St Pancras → Bloomsbury",
          detail: "Thameslink to St Pancras (~20 min), then a 12-min walk south to Tavistock Place. You’ll have spare time, so stroll Tavistock Square first (see below).",
        },
        {
          id: "d4-coffee", wiki: ["Tavistock Square", "Bloomsbury"], type: "food", time: "09:30", endTime: "10:00",
          name: "Bloomsbury Coffee House",
          area: "20 Tavistock Place, WC1",
          teaser: "A cosy basement café in the heart of literary Bloomsbury.",
          food: {
            knownFor: "A small, independent basement café popular with students from the nearby University of London colleges.",
            order: "Flat white and a pastry or toastie.",
            price: "£5–10",
            alternatives: "Store Street Espresso or Redemption Roasters nearby if it’s full.",
          },
          story: [
            "You’re in the Bloomsbury of the Bloomsbury Group, the circle of writers and artists around Virginia Woolf who lived in these squares in the early 1900s. Woolf lived at 46 Gordon Square, a few minutes away.",
            "Two minutes south, in Tavistock Square, look for the statue of Gandhi, who studied law in London. On the square’s east side, BMA House stands where <strong>Charles Dickens</strong> lived at Tavistock House from 1851 to 1860, writing <em>Bleak House</em>, <em>Little Dorrit</em> and <em>A Tale of Two Cities</em>. A plaque marks the spot: a good warm-up for tonight’s <em>Christmas Carol</em>.",
          ],
          checks: ["Opening hours: listings say Mon–Fri from 08:00. Confirm it’s trading. Small independents change often."],
          mapQuery: "Bloomsbury Coffee House, 20 Tavistock Place, London",
          sources: [{ label: "SquareMeal – Bloomsbury Coffee House", url: "https://www.squaremeal.co.uk/restaurant/bloomsbury-coffee-house" }, { label: "English Heritage – blue plaques", url: "https://www.english-heritage.org.uk/visit/blue-plaques/" }],
        },
        {
          id: "d4-bm", wiki: ["British Museum"], type: "sight", time: "10:20", endTime: "12:30",
          name: "British Museum",
          area: "Great Russell Street, Bloomsbury",
          teaser: "Two million years of human history, a stone that cracked hieroglyphs, and chessmen biting their shields.",
          free: true,
          myNotes: ["Booked: entry at 10:20 (your plan said 10:00)."],
          booked: { summary: "Mon 7 Dec · 10:20 entry · 7 tickets (General admission, free)", note: "Show the confirmation email or ticket at the entrance." },
          story: [
            "Sir Hans Sloane was a doctor who became rich partly through hot chocolate. He discovered cocoa in Jamaica and marketed it mixed with milk as a medicine. He also collected obsessively: 71,000 books, plants, coins and curiosities. When he died in 1753 he offered the lot to the nation for £20,000, far below its value. Parliament agreed, raised the money with a lottery, and created the British Museum, the first national public museum in the world, free to “all studious and curious persons”.",
            "It has collected, bought, received and sometimes taken objects ever since. The <strong>Rosetta Stone</strong>, a temple decree from 196 BC in three scripts, was found by French soldiers in Egypt in 1799 and seized by the British in 1801. Comparing its Greek with the hieroglyphs let Jean-François Champollion crack the ancient writing in 1822. It’s the museum’s most visited object.",
            "Several prize objects are claimed by their countries of origin, including the Parthenon sculptures from Athens and Hoa Hakananai’a, the moai statue from Rapa Nui (Easter Island). The labels increasingly tell those stories too.",
            "The courtyard at the centre was hidden for 150 years. Norman Foster’s glass roof turned it into the Great Court in 2000, the largest covered public square in Europe, wrapped around the round Reading Room where Karl Marx wrote <em>Das Kapital</em>.",
          ],
          facts: [
            "The museum holds about 8 million objects. Only around 1% are on display at any one time.",
            "The Great Court roof has 3,312 glass panels, and because the courtyard is irregular almost every one is a different shape.",
            "Painted on the Rosetta Stone’s sides you can still read “Captured in Egypt by the British Army in 1801” and “Presented by King George III”.",
            "The Sutton Hoo treasure, the grave goods of an Anglo-Saxon king buried in a 27-metre ship around AD 625, was dug up in 1939 on Edith Pretty’s land. She gave it all to the museum. The story is the film <em>The Dig</em>.",
            "There was once a British Museum Tube station on the Central line. It closed in 1933, and Londoners claimed it was haunted by the ghost of an Egyptian.",
          ],
          lookFor: [
            "<strong>The Lewis Chessmen</strong> (12th-century walrus ivory, found in 1831 on the Isle of Lewis). Find the “berserker” rooks biting the tops of their shields.",
            "<strong>The Sutton Hoo helmet</strong>, rebuilt from hundreds of rusted fragments, in the early medieval Europe galleries.",
            "<strong>The Rosetta Stone’s three scripts</strong>: hieroglyphs at the top, Demotic in the middle, Greek at the bottom.",
          ],
          practical: {
            hours: "Daily 10:00–17:00 (Fri until 20:30)",
            cost: "Free (special exhibitions charge)",
            booking: "Booked: Mon 7 Dec, 10:20",
            station: "Tottenham Court Road, Holborn or Russell Square",
            allow: "2½ hours. Grab a floor plan and choose three galleries.",
          },
          checks: ["Check for room closures (Egyptian sculpture, Sutton Hoo) on britishmuseum.org before you go."],
          mapQuery: "The British Museum, Great Russell Street, London",
          sources: [{ label: "British Museum – visit", url: "https://www.britishmuseum.org/visit" }, { label: "British Museum – history", url: "https://www.britishmuseum.org/about-us/british-museum-story" }, { label: "British Museum – Rosetta Stone", url: "https://www.britishmuseum.org/collection/object/Y_EA24" }],
        },
        {
          id: "d4-fiveguys", wiki: ["Five Guys", "Long Acre"], type: "food", time: "12:30", endTime: "13:15",
          name: "Five Guys, Covent Garden",
          area: "1–3 Long Acre, WC2",
          teaser: "The very first Five Guys in the UK. Burgers, Cajun fries and a milkshake.",
          food: {
            knownFor: "Five Guys started in Arlington, Virginia, in 1986: Jerry Murrell and his four sons were the five guys. The Long Acre branch, opened in July 2013, was its first in the UK.",
            order: "A “little” burger (it’s plenty) with your choice of free toppings, regular Cajun fries to share (portions are huge), and a milkshake with mix-ins.",
            price: "£15–22",
            alternatives: "Shake Shack in the Market Building, or cheaper eats in the Seven Dials area.",
          },
          story: ["Fries are cooked in peanut oil, so if anyone in the group has a nut allergy, tell the staff. Long Acre was once the street of London’s coachbuilders. The carriage trade gave way to car showrooms, then to fashion shops."],
          mapQuery: "Five Guys, 1-3 Long Acre, Covent Garden, London",
          sources: [{ label: "Covent Garden – Five Guys", url: "https://www.coventgarden.london/brand-directory/five-guys" }, { label: "Hot Dinners – Five Guys’ first UK site", url: "https://hot-dinners.com/Gastroblog/Latest-news/us-burger-chain-five-guys-to-open-across-the-uk-starting-with-covent-garden" }],
        },
        {
          id: "d4-leg2", type: "travel", time: "13:15", mode: "tube", modeLabel: "Tube",
          from: "Covent Garden", to: "Bank",
          detail: "Piccadilly line one stop to Holborn, then the Central line to Bank (about 20 min plus walking). Leadenhall Market is 5 min from Bank.",
        },
        {
          id: "d4-leadenhall", wiki: ["Leadenhall Market"], type: "sight", time: "13:45", endTime: "14:15",
          name: "Leadenhall Market",
          area: "City of London",
          teaser: "A painted Victorian arcade on the site of Roman London’s forum, and the way into Diagon Alley.",
          free: true, light: "day",
          story: [
            "Stand in the middle of Leadenhall Market and you’re standing on the heart of Roman Londinium. Around AD 100 this was the site of the forum and basilica, the town’s market square and town hall. The basilica was the largest Roman building north of the Alps.",
            "The name comes from a lead-roofed mansion that stood here in the 1300s. In 1411 the City bought it, with the help of the Lord Mayor Richard “Dick” Whittington, of pantomime fame, and it became a market for poultry, game, cheese and butter. In 1881 Sir Horace Jones, the City’s architect, who also designed Tower Bridge, gave it the glass roof, cobbles and maroon-and-cream ironwork you see.",
            "Film crews love it. Leadenhall played Diagon Alley in <em>Harry Potter and the Philosopher’s Stone</em>. The entrance to the Leaky Cauldron was an optician’s doorway, now painted blue, on Bull’s Head Passage. Today the shops serve City workers: pubs, cheese, shoes and a Christmas tree under the glass.",
          ],
          facts: [
            "Fragments of the Roman basilica wall survive in the basement of a hairdresser’s on the market.",
            "Across the street is the Lloyd’s building (1986), Richard Rogers’s “inside-out” tower with its lifts, pipes and stairs on the outside. In 2011 it became the youngest building ever listed Grade I.",
            "The silver dragons on the market’s arches hold the City of London’s coat of arms. The dragons are the City’s guardians.",
            "Leadenhall was also used as a location in <em>Lara Croft: Tomb Raider</em> and in music videos.",
          ],
          lookFor: [
            "<strong>The Leaky Cauldron door</strong>, the blue doorway at 42 Bull’s Head Passage.",
            "<strong>The painted dragons and City crests</strong> high on the ironwork.",
            "<strong>The Lloyd’s building’s</strong> outside lifts, across Lime Street.",
          ],
          practical: {
            hours: "Public walkway open 24 hours. Shops mostly Mon–Fri 10:00–18:00 (perfect for a Monday).",
            cost: "Free",
            booking: "None",
            station: "Bank or Monument",
            allow: "30 min (plus the gap. See the day’s note on fitting in St Paul’s.)",
          },
          mapQuery: "Leadenhall Market, London",
          sources: [{ label: "City of London – Leadenhall Market", url: "https://leadenhallmarket.co.uk/" }, { label: "Historic England – Leadenhall Market", url: "https://historicengland.org.uk/listing/the-list/list-entry/1286400" }],
        },
        {
          id: "d4-gherkin", wiki: ["30 St Mary Axe"], type: "sight", time: "15:15", endTime: "15:30",
          name: "The Gherkin (30 St Mary Axe)",
          area: "City of London",
          teaser: "A glass torpedo with one curved pane, and a 1,600-year-old grave at its foot.",
          free: true, light: "day",
          story: [
            "On 10 April 1992 an IRA bomb devastated the Baltic Exchange, the shipping market that had stood on this spot since 1903. When the site was redeveloped, Norman Foster’s team designed something the City had never seen: a 180-metre tower that swells in the middle and tapers to a point, nicknamed “the Gherkin” before it was even finished in 2003–04.",
            "The shape isn’t just showing off. The curved form lets wind slide round it, cutting down the gusts that slam into flat-sided towers at street level. Spiral light wells cut through every floor and pull fresh air through the building, so it uses far less energy than a conventional office block. And despite the curves, only one piece of glass is actually curved: the lens-shaped cap at the very top. Every other panel is flat, set at a slightly different angle.",
            "When the ground was dug up in 1995, archaeologists found the grave of a Roman girl, a teenager buried around AD 350. In 2007 she was reburied at the foot of the tower with a stone inscribed in Latin and English. It’s easy to walk past.",
          ],
          facts: [
            "The Gherkin isn’t open to visitors. The only way in is the Helix restaurant and bar at the top (pricey and booked ahead).",
            "The Baltic Exchange’s stained-glass war memorial survived the bomb. It was restored and is now displayed at the National Maritime Museum in Greenwich, which you could see tomorrow.",
            "Nearby are “the Walkie-Talkie”, whose concave glass once focused sunlight so strongly in 2013 that it melted parts of a parked Jaguar, and “the Cheesegrater” and “the Scalpel”.",
            "St Mary Axe is named after a lost medieval church, said to have kept an axe used to martyr St Ursula’s maidens.",
          ],
          lookFor: [
            "<strong>The Roman girl’s gravestone</strong> at the base of the tower, on the St Mary Axe side.",
            "<strong>The diagonal steel grid</strong> (“diagrid”). Look straight up from the plaza.",
          ],
          practical: {
            hours: "Exterior only",
            cost: "Free to look",
            booking: "Only for the Helix restaurant",
            station: "Aldgate or Liverpool Street",
            allow: "15 min",
          },
          mapQuery: "30 St Mary Axe, London",
          sources: [{ label: "Foster + Partners – 30 St Mary Axe", url: "https://www.fosterandpartners.com/projects/30-st-mary-axe" }, { label: "MOLA – Roman girl reburial", url: "https://www.mola.org.uk/" }],
        },
        {
          id: "d4-walk-tb", wiki: ["All Hallows-by-the-Tower"], type: "walk", time: "15:30", endTime: "16:15",
          name: "Walk: the City to Tower Bridge",
          area: "Aldgate → Tower Hill",
          teaser: "Past London’s oldest church, where Pepys watched the Great Fire, to the river as the lights come on.",
          light: "day",
          story: [
            "From the Gherkin, head south to Tower Hill. On the way you pass <strong>All Hallows by the Tower</strong>, founded in 675 and the oldest church in the City of London. Its crypt has a Roman pavement and a Saxon arch built with re-used Roman tiles. In September 1666 Samuel Pepys climbed its tower to watch the Great Fire. He wrote that it was “the saddest sight of desolation that I ever saw”. William Penn, founder of Pennsylvania, was baptised here, and John Quincy Adams, later US President, was married here.",
            "Just beyond, on Tower Hill, a small paved square marks the site of the scaffold where more than 100 people were publicly executed, including Thomas More. Then drop down to the riverside path below the Tower walls, and Tower Bridge rises in front of you. Sunset is about 15:52, so you’ll catch the last light and then the bridge’s lamps coming on.",
          ],
          facts: [
            "All Hallows’ tower survived the Great Fire because Admiral William Penn (father of the Pennsylvania founder) had his sailors blow up surrounding houses to make a firebreak.",
            "The church is free to visit, usually open daily. Check times if you want the crypt.",
          ],
          lookFor: [
            "<strong>The Saxon arch</strong> inside All Hallows, built in about 675 with re-used Roman tiles.",
            "<strong>The Tower Hill scaffold memorial</strong> in Trinity Square Gardens.",
          ],
          practical: {
            hours: "Outdoors. Church usually open daytime.",
            cost: "Free",
            booking: "None",
            station: "Tower Hill",
            allow: "30–45 min (about 1.5 km)",
          },
          mapQuery: "All Hallows by the Tower, London",
          sources: [{ label: "All Hallows by the Tower", url: "https://www.ahbtt.org.uk/" }],
        },
        {
          id: "d4-towerbridge", wiki: ["Tower Bridge"], type: "sight", time: "16:15", endTime: "16:45",
          name: "Tower Bridge",
          area: "Tower Bridge Road",
          teaser: "Glass floors 42 metres above the Thames, and a bridge a London bus once jumped.",
          light: "night",
          book: { what: "Tower Bridge – timed tickets, Mon 7 Dec ~16:15 (student rate with ID)", when: "a few days ahead", link: "https://www.towerbridge.org.uk/", priority: "recommended" },
          story: [
            "By the 1870s the East End was booming, and crossing the river below London Bridge meant long detours. A new bridge was needed, but tall-masted ships still had to reach the Pool of London. After a public competition with more than 50 entries, the City chose a bascule (see-saw) design by its architect Sir Horace Jones and the engineer John Wolfe Barry. Its two road decks swing up on enormous counterweights.",
            "It opened on 30 June 1894, powered by steam engines pumping water into hydraulic accumulators. The steel frame is clothed in Cornish granite and Portland stone so it would match the Tower next door. Critics called it a monstrous fake-Gothic sham; the public loved it immediately.",
            "The high walkways were built so pedestrians could cross while the bridge was raised. But climbing the towers took longer than waiting, and the walkways became a haunt of pickpockets, so they were closed in 1910. They reopened in 1982 as an exhibition, and in 2014 glass floors were added, so now you can stand 42 metres above the traffic and watch buses pass under your feet.",
          ],
          facts: [
            "In December 1952 a number 78 bus was on the bridge when it began to rise. Driver Albert Gunter accelerated and jumped the gap, landing on the other side. He got £10 and a day off.",
            "In 1968 RAF pilot Alan Pollock flew a Hawker Hunter jet through the gap between the walkways and the road. He was arrested on landing.",
            "In 1997 President Clinton’s motorcade was split in two when the bridge rose for a passing barge, unannounced.",
            "The bridge was painted red, white and blue for the Queen’s Silver Jubilee in 1977. Before that it was a muddy brown.",
            "It still lifts around 800 times a year, and lift times are published online.",
          ],
          lookFor: [
            "<strong>The glass floor</strong>. If you’re lucky, check the lift schedule and watch the bascules open beneath you.",
            "<strong>The Victorian Engine Rooms</strong> in the south tower’s base, with their gleaming original steam engines.",
            "<strong>HMS Belfast</strong>, the Second World War cruiser moored upstream, from the walkway.",
          ],
          practical: {
            hours: "Daily 09:30–18:00, last entry 17:00",
            cost: "Adult about £16–18, student (16+ with ID) about £12–13.50",
            booking: "Recommended (pre-booking essential, says the official site)",
            station: "Tower Hill, or London Bridge (15 min walk)",
            allow: "45–60 min (your plan has 30 min. The walkways alone take 30.)",
          },
          checks: ["Current 2026–27 ticket prices: the official table found was labelled “until 31 March 2026”. Also check lift times for 7 Dec on towerbridge.org.uk."],
          mapQuery: "Tower Bridge, London",
          sources: [{ label: "Tower Bridge – opening hours", url: "https://www.towerbridge.org.uk/opening-hours" }, { label: "Tower Bridge – history", url: "https://www.towerbridge.org.uk/history" }],
        },
        {
          id: "d4-leg3", type: "travel", time: "16:45", mode: "tube", modeLabel: "Walk + Jubilee line",
          from: "Tower Bridge", to: "Waterloo",
          detail: "Walk along the South Bank to London Bridge station (12 min), then the Jubilee line 2 stops to Waterloo. About 25 min.",
        },
        {
          id: "d4-waterloo", wiki: ["London Waterloo station"], type: "walk", time: "17:00",
          name: "Explore Waterloo",
          area: "Waterloo, Lower Marsh & The Cut",
          teaser: "A station named after Napoleon’s defeat, a legal graffiti tunnel, and the Kinks’ favourite sunset.",
          light: "night",
          story: [
            "Waterloo Bridge, opened in 1817, was named after the battle won two years earlier, and the station that followed in 1848 took the name too. When Eurostar trains from Paris started arriving here in 1994, some French commentators were less than amused that their first sight of London was a station named after Napoleon’s defeat. The trains moved to St Pancras in 2007.",
            "The station’s grand <strong>Victory Arch</strong> entrance, opened in 1922, is a memorial to the railway staff killed in the First World War. Inside, the four-faced clock hanging over the concourse has been London’s favourite meeting place for generations: “meet you under the clock at Waterloo”.",
            "Under the tracks runs <strong>Leake Street</strong>, a 300-metre tunnel where graffiti is legal. It was launched by Banksy’s Cans Festival in 2008, and it’s repainted so often that it’s never the same twice. Nearby, Lower Marsh is an old street market, and The Cut leads to the Old Vic and its neighbour the Young Vic.",
            "In 1967 Ray Davies of the Kinks wrote “Waterloo Sunset” about two lovers meeting here every Friday. Walk five minutes to Waterloo Bridge for the view he meant: west to Parliament, east to St Paul’s.",
          ],
          facts: [
            "Waterloo is one of Britain’s busiest stations, with more platforms than any other in the country.",
            "There was once a railway from Waterloo that carried coffins to Brookwood Cemetery in Surrey, the “Necropolis Railway”. Its private London station still stands on Westminster Bridge Road.",
            "Waterloo Bridge was rebuilt in the 1940s largely by women, and is sometimes called “the Ladies’ Bridge”.",
          ],
          lookFor: [
            "<strong>Victory Arch</strong>, with Britannia on top, at the station’s main entrance.",
            "<strong>Leake Street’s tunnel</strong>. Watch artists at work, and mind the wet paint.",
            "<strong>The view from Waterloo Bridge</strong> at dusk: the “Waterloo Sunset” view.",
          ],
          practical: {
            hours: "Any time",
            cost: "Free",
            booking: "None",
            station: "Waterloo",
            allow: "1 hour",
          },
          mapQuery: "Leake Street Tunnel, London",
          sources: [{ label: "Network Rail – Waterloo", url: "https://www.networkrail.co.uk/communities/passengers/our-stations/london-waterloo/" }, { label: "Leake Street Arches", url: "https://leakestreetarches.london/" }],
        },
        {
          id: "d4-ramen", wiki: ["Ramen"], type: "food", time: "18:15", endTime: "18:45",
          name: "Fukuoka-style ramen near the Old Vic",
          area: "The Cut, Waterloo",
          teaser: "Rich, milky tonkotsu broth: the warming bowl Fukuoka is famous for.",
          myNotes: ["“Fukuoka Ramen Bar, Waterloo”. Budget £10–15."],
          food: {
            knownFor: "Hakata (Fukuoka) ramen uses pork-bone tonkotsu broth simmered for hours until creamy, with thin, firm noodles. Diners traditionally order a <em>kaedama</em>, an extra portion of noodles, when they finish the first.",
            order: "Classic tonkotsu with chashu pork and a soft egg. Ask for “katame” (firm) noodles.",
            price: "£10–16",
            alternatives: "Several noodle and Japanese spots are on Lower Marsh and The Cut, all within 5 min of the Old Vic.",
          },
          story: ["The restaurant matching your note looks like <strong>Yamagoya</strong> on The Cut, a ramen bar from a chain founded in Fukuoka. If that’s the one you meant, it’s about two minutes’ walk from the Old Vic, perfect for an 18:15 bowl before a 19:00 curtain."],
          checks: ["I couldn’t find a venue literally called “Fukuoka Ramen Bar” in Waterloo. The closest match is Yamagoya (Fukuoka-origin tonkotsu) on The Cut, SE1. Confirm the name and that it’s still open."],
          mapQuery: "Yamagoya ramen The Cut Waterloo London",
          sources: [{ label: "JETAA – Yamagoya Waterloo review", url: "https://jetaa.org.uk/news/yamagoya-waterloo-restaurant-review/" }],
        },
        {
          id: "d4-carol", wiki: ["The Old Vic"], type: "sight", time: "19:00",
          name: "A Christmas Carol at the Old Vic",
          area: "The Old Vic, The Cut, SE1 8NB",
          teaser: "Dickens’s ghost story, staged in the round under hundreds of lanterns, with mince pies.",
          myNotes: ["Tickets: booked. No need to print; they scan the ticket from your phone."],
          light: "night",
          booked: { summary: "Mon 7 Dec · 19:00 · Baylis Circle (top tier), Row A · restricted view (rail in eyeline) · £44.50 per ticket", note: "E-ticket PDF from the Old Vic. Latecomers may not be admitted. Baylis Circle is up several flights of stairs, so arrive by 18:40." },
          story: [
            "In October 1843 Charles Dickens was in debt, and his latest novel was selling badly. He also burned with anger at the child poverty he had seen in London’s ragged schools and in a government report on child labour. He decided to write “a sledgehammer” for the poor, in the form of a Christmas story. He wrote <em>A Christmas Carol</em> in about six weeks, walking 15 or 20 miles through London’s streets at night as he composed it, and paid for the lavish printing himself. Published on 19 December 1843, its 6,000 copies sold out by Christmas Eve. It made Dickens famous all over again, and it helped revive the Victorian Christmas of turkey, charity and family.",
            "The Old Vic itself is older than the story. It opened in 1818 as the Royal Coburg Theatre, was renamed in honour of the young Princess Victoria, and under the formidable Lilian Baylis became the home of Shakespeare for the people. From 1963 to 1976 it was the first home of Laurence Olivier’s National Theatre.",
            "This production, adapted by Jack Thorne and directed by Matthew Warchus, has returned every winter since 2017. The stage runs through the middle of the auditorium, lanterns hang over everyone’s heads, and the cast hand out treats. Expect music, handbells, and a finale in which the audience helps build the feast. Bring tissues.",
          ],
          facts: [
            "The 2026 run is listed as 12 Nov 2026 to 9 Jan 2027, with evening shows at 19:00 Mon–Sat. Giles Terera was announced as Scrooge in the September 2026 casting.",
            "The show runs about 2 hours including a 20-minute interval.",
            "Dickens gave public readings of <em>A Christmas Carol</em> for 17 years and chose it for his final farewell reading in March 1870, three months before he died.",
            "“Bah! Humbug!”, “Merry Christmas!” as a common greeting, and even the word “Scrooge” for a miser were all popularised by the book.",
            "The Old Vic was bombed in the Blitz in 1941 and was repaired after the war.",
          ],
          lookFor: [
            "<strong>The lanterns</strong> filling the space above the audience. Watch what they do in the final scene.",
            "<strong>The Old Vic’s 1818 façade</strong> on The Cut, lit up for Christmas.",
          ],
          practical: {
            hours: "Performance 19:00. Arrive by 18:40; latecomers may wait for a suitable break.",
            cost: "Your seats: £44.50 each (Baylis Circle, restricted view)",
            booking: "Booked",
            station: "Waterloo or Southwark (5 min walk)",
            allow: "About 2 hours, finishing around 21:00",
            address: "The Cut, London SE1 8NB",
          },
          checks: ["Casting can change: Giles Terera was announced as Scrooge in September 2026."],
          mapQuery: "The Old Vic, The Cut, London SE1 8NB",
          sources: [{ label: "The Old Vic", url: "https://www.oldvictheatre.com/" }, { label: "West End Theatre – 2026 cast announcement", url: "https://www.westendtheatre.com/368781/news/a-christmas-carol-old-vic-full-cast-announced/" }, { label: "British Library – A Christmas Carol", url: "https://www.bl.uk/romantics-and-victorians/articles/a-christmas-carol-and-dickens" }],
        },
      ],
    },

    /* ============================== DAY 5 ============================== */
    {
      title: "Greenwich & departure",
      line: { name: "Meridian line", colour: "#9b0056" },   // this day’s colour on the trip map
      neighbourhoods: ["Greenwich", "Greenwich Park", "Greenwich Peninsula", "Royal Docks"],
      nutshell: "A last day in Greenwich, where time itself is measured. You’ll see England’s first classical house, Wren’s riverside palace for sailors, and the park’s great view back over London. Then you fly over the Thames by cable car on the way to Luton for the 20:25 flight home.",
      alerts: [
        {
          level: "clash",
          title: "The Royal Observatory is closed",
          html: "<p>Royal Museums Greenwich closed the Royal Observatory to visitors from <strong>2 November 2026</strong> for a £77m redevelopment (“First Light”). The Meridian Courtyard is due back in summer 2027 and the full site in 2028. You can still walk up through <strong>Greenwich Park</strong> for the view from the hilltop (free). For astronomy, the <strong>National Maritime Museum</strong> next to the Queen’s House is hosting a temporary planetarium and an “Astronomers Take Over” gallery.</p>",
        },
        {
          level: "clash",
          title: "Flight W4 3648 leaves Luton at 20:25",
          html: "<p>Be at Luton by about <strong>18:25</strong>. From Greenwich it’s roughly 1h45 via the cable car, Elizabeth line (Custom House → Farringdon) and Thameslink (Farringdon → Luton Airport Parkway), then the DART shuttle. So <strong>leave the cable car’s north side by about 16:40</strong>.</p><p><strong>Suggested afternoon:</strong></p><ol><li>14:00–15:00 Greenwich Park</li><li>15:00–15:45 Greenwich Market</li><li>15:45 bus to North Greenwich</li><li>16:10 cable car across the river, just after sunset</li><li>16:30 Elizabeth line from Custom House</li><li>about 18:10 at the airport</li></ol><p><strong>If your bags are still in Mill Hill:</strong> skip the cable car. Take a train from Greenwich to London Bridge at about 15:45, Thameslink to Mill Hill Broadway, collect your bags, then Thameslink on to Luton Airport Parkway (about 25 min). You’d be at the airport by about 18:30.</p>",
        },
        {
          level: "minor",
          title: "Gaps and a long slot",
          html: "<ul><li><strong>10:00–11:00</strong> is free. Wander the <strong>Old Royal Naval College</strong> grounds (free) or see the <strong>Painted Hall</strong>, “Britain’s Sistine Chapel” (paid, student price about half of adult).</li><li><strong>Queen’s House 11:00–13:00</strong> is generous; most people need about an hour. Spend the second hour in the free National Maritime Museum next door.</li><li><strong>Luggage:</strong> you only have under-seat bags (40 × 30 × 20 cm), so carrying them all day is realistic.</li></ul>",
        },
      ],
      items: [
        {
          id: "d5-leg1", type: "travel", time: "08:30", mode: "train", modeLabel: "Thameslink + Southeastern",
          from: "Mill Hill Broadway", to: "Greenwich",
          detail: "Bring your bags if you’re checking out. Thameslink to London Bridge (~40 min), then a Southeastern train 2 stops to Greenwich (~8 min). Alternatively, the Jubilee line to Canary Wharf, then the DLR to Cutty Sark. Allow about 1 hour.",
        },
        {
          id: "d5-coffee", wiki: ["Cutty Sark"], type: "food", time: "09:30", endTime: "10:00",
          name: "Coffee in Greenwich",
          area: "Greenwich town centre",
          teaser: "Coffee by the Cutty Sark before the museums open.",
          food: {
            knownFor: "Greenwich town centre around the market and Cutty Sark has plenty of independent cafés and bakeries.",
            order: "A flat white and a warm pastry. Take it down to the riverside by the Cutty Sark.",
            price: "£4–8",
            alternatives: "The Old Royal Naval College visitor centre café, or the market’s coffee stalls once they open around 10:00.",
          },
          story: [
            "You’re next to the <strong>Cutty Sark</strong> (1869), the fastest tea clipper of her age, which once sailed from Australia to Britain in 73 days. Her name comes from Robert Burns’s poem <em>Tam o’ Shanter</em>: a “cutty sark” is a short nightdress, worn by the witch Nannie, who chases Tam and grabs his horse’s tail. Look at the ship’s figurehead: Nannie, with a tail in her hand.",
            "Nearby a small domed building leads to the <strong>Greenwich Foot Tunnel</strong>, opened in 1902 so dockworkers could walk under the Thames to the Isle of Dogs. It’s free, open 24 hours, and echoes wonderfully.",
          ],
          mapQuery: "Cutty Sark, Greenwich",
          sources: [{ label: "Royal Museums Greenwich – Cutty Sark", url: "https://www.rmg.co.uk/cutty-sark" }],
        },
        {
          id: "d5-queens", wiki: ["Queen's House"], type: "sight", time: "11:00", endTime: "13:00",
          name: "The Queen’s House",
          area: "Greenwich, by the National Maritime Museum",
          teaser: "England’s first classical building, a spiral staircase with a ghost, and Elizabeth I’s Armada portrait. Free.",
          free: true,
          book: { what: "Queen’s House – free ticket, Tue 8 Dec 11:00 (RMG recommends booking)", when: "a week ahead", link: "https://www.rmg.co.uk/queens-house", priority: "recommended" },
          story: [
            "In 1616 Anne of Denmark, wife of James I, asked Inigo Jones to build her a private retreat at Greenwich. Legend says it was an apology from James for swearing at her in public after she accidentally shot his favourite dog while hunting. Jones had just come back from Italy, where he had studied the buildings of Palladio, and he designed something England had never seen: a crisp white villa built on mathematical proportions, with none of the Tudor turrets and gables around it.",
            "Anne died in 1619 before it was finished. The house was completed in the 1630s for Henrietta Maria, Charles I’s queen, who called it her “house of delight”. It is the first consciously classical building in England, the ancestor of countless porticoed Georgian houses.",
            "Its <strong>Great Hall</strong> is a perfect 40-foot cube. Off it spirals the <strong>Tulip Stairs</strong>, the first geometric self-supporting spiral staircase in Britain, with no central pole. In 1966 a visiting Canadian clergyman photographed the empty staircase. When the film was developed, it seemed to show shrouded figures climbing the stairs, gripping the rail. The photo has never been explained.",
            "Upstairs hangs the <strong>Armada Portrait</strong> of Elizabeth I, painted to celebrate the defeat of the Spanish fleet in 1588. Her hand rests on a globe, over the Americas.",
          ],
          facts: [
            "The “tulips” in the Tulip Stairs’ ironwork are probably lilies: fleurs-de-lis, a nod to Henrietta Maria, a French princess.",
            "The Armada Portrait was bought for the nation in 2016 for about £10.3 million, after a public appeal.",
            "The Great Hall’s ceiling is a 2016 work in gold leaf by Turner Prize winner Richard Wright. The original painted ceiling was moved to Marlborough House in the 1700s.",
            "The Queen’s House is free and usually open daily 10:00–17:00.",
          ],
          lookFor: [
            "<strong>The Tulip Stairs</strong>. Look straight up the spiral from the bottom.",
            "<strong>The Great Hall’s floor</strong>, a black-and-white marble pattern that mirrors the ceiling.",
            "<strong>The Armada Portrait</strong>, with the Spanish fleet wrecked in a storm in the background.",
          ],
          practical: {
            hours: "Daily 10:00–17:00 (closed 24–26 Dec)",
            cost: "Free",
            booking: "Free ticket recommended by RMG, but walk-ups are usually fine",
            station: "Cutty Sark (DLR) or Greenwich",
            allow: "1 hour. Spend the second hour in the free National Maritime Museum next door: Nelson’s Trafalgar coat (with the bullet hole), and the Baltic Exchange memorial glass from yesterday’s Gherkin story.",
          },
          mapQuery: "The Queen's House, Greenwich",
          sources: [{ label: "Royal Museums Greenwich – Queen’s House", url: "https://www.rmg.co.uk/queens-house" }, { label: "RMG – Tulip Stairs ghost", url: "https://www.rmg.co.uk/stories/topics/queens-house-ghost" }, { label: "RMG – opening times", url: "https://www.rmg.co.uk/plan-your-visit/opening-times" }],
        },
        {
          id: "d5-nandos", wiki: ["Nando's", "Greenwich"], type: "food", time: "13:00",
          name: "Lunch: Nando’s Greenwich",
          area: "Greenwich",
          teaser: "Flame-grilled peri-peri chicken. Choose your heat.",
          food: {
            knownFor: "Peri-peri chicken, born in Johannesburg in 1987 when Fernando Duarte and Robert Brozin bought a Portuguese-Mozambican chicken shop. The rooster logo is the Rooster of Barcelos, from a Portuguese folk tale.",
            order: "Quarter or half chicken (Medium or Hot), PERi-salted chips and Macho Peas.",
            price: "£12–18",
            alternatives: "Greenwich Market’s street-food stalls (open daily) are cheaper and faster.",
          },
          story: ["Nando’s reached the UK in 1992 and became so much a part of British student life that “cheeky Nando’s” entered the language. Order at the till with your table number, and refill your own soft drink."],
          mapQuery: "Nando's Greenwich",
          sources: [{ label: "Nando’s – restaurants", url: "https://www.nandos.co.uk/restaurants" }],
        },
        {
          id: "d5-park", wiki: ["Greenwich Park"], type: "sight", time: "14:00", endTime: "16:00", suggestedTime: "14:00", suggestedEnd: "15:00", suggestedWhy: "the Observatory is closed, and you need to leave for Luton by about 16:30",
          name: "Greenwich Park (Royal Observatory closed)",
          area: "Greenwich Park",
          teaser: "London’s oldest enclosed royal park, the home of Greenwich Mean Time, and the best free view of the city.",
          light: "day", free: true,
          alerts: [{ level: "clash", title: "Royal Observatory closed from 2 Nov 2026", html: "<p>Under redevelopment until 2028 (Meridian Courtyard planned to reopen summer 2027). The park is open. For astronomy today, try the National Maritime Museum’s temporary planetarium.</p>" }],
          story: [
            "Greenwich Park was enclosed in 1433, making it the oldest of London’s royal parks. Henry VIII, born at Greenwich Palace by the river, hunted deer here. In 1675 Charles II commissioned Christopher Wren to build an observatory on the hilltop “for the perfecting of navigation and astronomy”. Sailors needed to know their longitude at sea; getting it wrong wrecked ships and drowned crews.",
            "Over the next two centuries the astronomers here mapped the stars so precisely that in 1884, at an international conference in Washington, the line through Greenwich was chosen as the world’s Prime Meridian, longitude 0°. France abstained and kept using the Paris meridian for another 27 years.",
            "The Observatory buildings are closed for a major restoration, but the hill is not. Climb to the statue of General Wolfe at the top. From there the whole composition opens up: the white Queen’s House framed by Wren’s twin domes of the Old Royal Naval College, the river beyond, and the towers of Canary Wharf and the City behind. With sunset at about 15:52, aim to be up there by 15:00 for the best light.",
          ],
          facts: [
            "The red “time ball” on top of the Observatory has dropped at exactly 13:00 every day since 1833, so ships on the Thames could set their clocks.",
            "The Shepherd Gate Clock on the Observatory’s outer wall (1852) was the first public clock to show Greenwich Mean Time. Unusually, it has a 24-hour dial.",
            "The modern GPS zero line actually runs about 102 m east of the famous brass meridian line, because satellites use a different model of the Earth’s shape.",
            "The fallen “Queen Elizabeth’s Oak” in the park is said to be where Henry VIII danced with Anne Boleyn and Elizabeth I picnicked. It died in the 1800s and finally fell in 1991.",
          ],
          lookFor: [
            "<strong>The view from General Wolfe’s statue</strong>, the classic Greenwich-to-Canary-Wharf panorama.",
            "<strong>The Shepherd Gate Clock</strong> and the brass Imperial length standards beside it, if the outer wall is accessible during the works.",
            "<strong>The time ball</strong>. If it’s still operating during the works, watch it drop at 13:00.",
          ],
          practical: {
            hours: "Park: daily from 06:00 until dusk (gates close around 16:15–17:00 in December). Observatory: closed.",
            cost: "Free (park)",
            booking: "None",
            station: "Cutty Sark (DLR) or Greenwich, then 10-min uphill walk",
            allow: "1 hour. Use the spare hour for the Painted Hall or the National Maritime Museum.",
          },
          checks: ["Greenwich Park gate closing time in December, whether the Shepherd Gate Clock and time ball are visible during the Observatory works, and National Maritime Museum temporary planetarium show times and prices."],
          mapQuery: "General Wolfe Statue, Greenwich Park",
          sources: [{ label: "RMG – Royal Observatory closure", url: "https://www.rmg.co.uk/royal-observatory" }, { label: "Time Out – Observatory £77m makeover", url: "https://www.timeout.com/london/news/royal-greenwhich-observatory-closure-77-million-pound-makeover-090926" }, { label: "Royal Parks – Greenwich Park", url: "https://www.royalparks.org.uk/visit/parks/greenwich-park" }],
        },
        {
          id: "d5-market", wiki: ["Greenwich Market"], type: "sight", time: "16:00", suggestedTime: "15:00", suggestedEnd: "15:45", suggestedWhy: "so you can reach Luton by about 18:25",
          name: "Greenwich Market",
          area: "Greenwich town centre",
          teaser: "A covered market with a Bible verse over the door, and stalls of crafts, vintage and street food.",
          light: "night",
          story: [
            "Greenwich has had a market since the Middle Ages. Its royal charter dates from 1700, when the rights were granted to the new Greenwich Hospital for seamen, Wren’s great building by the river, so market rents helped fund the care of old sailors. The covered market you walk into today was built in the 1830s, and the iron-and-glass roof came later.",
            "Above the entrance, carved in stone, is a warning for any trader tempted to cheat: “A false balance is abomination to the Lord, but a just weight is his delight” (Proverbs 11:1). It was a reminder that the market’s scales were checked. Inside, the stalls change daily, with arts and crafts, vintage, and a ring of street-food traders around the edge.",
          ],
          facts: [
            "Greenwich Market is usually open daily from about 10:00 to 17:30.",
            "It’s one of the few historic markets in London still in its original covered building.",
            "It’s a great place for last-minute, locally made gifts: prints, ceramics and jewellery.",
          ],
          lookFor: [
            "<strong>The inscription</strong> above the market’s entrance arch: “A false balance is abomination to the Lord…”",
          ],
          practical: {
            hours: "Usually daily about 10:00–17:30",
            cost: "Free to browse",
            booking: "None",
            station: "Cutty Sark (DLR)",
            allow: "45 min",
          },
          checks: ["Greenwich Market hours on 8 Dec (some stalls pack up early on dark winter weekdays)."],
          mapQuery: "Greenwich Market, London",
          sources: [{ label: "Greenwich Market", url: "https://www.greenwichmarket.london/" }],
        },
        {
          id: "d5-leg2", type: "travel", time: "15:45", mode: "bus", modeLabel: "Bus 188 or 129",
          from: "Greenwich (Cutty Sark)", to: "North Greenwich",
          detail: "About 15–20 min. Then it’s a 5-min walk to the IFS Cloud Greenwich Peninsula cable car terminal.",
        },
        {
          id: "d5-cablecar", wiki: ["London cable car"], type: "sight", when: "After the market", suggestedTime: "16:10", suggestedWhy: "cross just after sunset, then head to Luton",
          name: "IFS Cloud Cable Car",
          area: "Greenwich Peninsula → Royal Docks",
          teaser: "Ten minutes, 90 metres up, across the Thames at night: the best ride to an airport anywhere.",
          light: "night",
          story: [
            "The cable car opened in June 2012, just before the London Olympics, as the first urban cable car in the UK. It carries passengers about a kilometre across the Thames from the Greenwich Peninsula, by the O2’s white dome, to the Royal Docks on the north bank, rising to about 90 metres.",
            "It was sold as a commuter link, but commuters never really came. A Freedom of Information request in 2013 famously suggested that only a handful of people used it regularly enough to count as commuters. For visitors, though, it’s one of the best-value views in London, especially after dark, with Canary Wharf glittering to the west, the O2 below, and planes lining up for London City Airport just ahead.",
            "On the north side, at Royal Victoria, you’re well placed for the airport: the DLR to London City Airport, or a short walk to Custom House for the Elizabeth line west to Heathrow.",
          ],
          facts: [
            "It was called the Emirates Air Line until 2022, when the sponsorship passed to software firm IFS.",
            "Each gondola holds up to 10 people. Cars run about every 30 seconds.",
            "The crossing takes about 10 minutes, and it runs more slowly in the evening so you can enjoy the view.",
            "Pay by contactless at the gate. It isn’t included in TfL’s daily caps.",
          ],
          lookFor: [
            "<strong>The O2</strong>: count its 12 yellow masts, one for each month (or hour on a clock face).",
            "<strong>Canary Wharf’s towers</strong> reflected in the river to the west.",
          ],
          practical: {
            hours: "Winter: usually Mon–Thu 08:00–21:00, Fri 09:00–22:00 (Sat later). Weather-dependent: closes in strong wind or lightning.",
            cost: "About £6–8 single with contactless (not capped)",
            booking: "Not needed; just tap in",
            station: "North Greenwich (Jubilee) → Royal Victoria (DLR)",
            allow: "30 min including queue",
          },
          checks: ["Winter 2026 hours and fare on tfl.gov.uk/cable-car. An undated listing mentioned a late-Nov/early-Dec maintenance closure, so check it’s running on 8 Dec. If it isn’t, take the Jubilee line from North Greenwich to Canary Wharf, then the Elizabeth line."],
          mapQuery: "IFS Cloud Greenwich Peninsula cable car",
          sources: [{ label: "TfL – IFS Cloud Cable Car", url: "https://tfl.gov.uk/modes/london-cable-car/" }, { label: "Visit Greenwich – cable car", url: "https://visitgreenwich.org.uk/things-to-do/london-cable-car-p1372331" }],
        },
        {
          id: "d5-airport", wiki: ["Luton Airport"], type: "flight", time: "20:25", when: "Evening",
          name: "Luton Airport: flight home",
          area: "London Luton (LTN) · Wizz Air W4 3648 to Suceava",
          teaser: "Departs 20:25, lands in Suceava 01:35. Be at the airport by about 18:25.",
          story: [
            "<strong>From the cable car (Royal Victoria):</strong> walk 5 min to Custom House, then the Elizabeth line to Farringdon (about 20 min). Take Thameslink towards Bedford/Luton to <strong>Luton Airport Parkway</strong> (about 35 min), then the <strong>Luton DART</strong> shuttle to the terminal (about 4 min, charged separately). Allow about 1h45 door to door.",
            "<strong>From Mill Hill (if collecting bags):</strong> Thameslink from Mill Hill Broadway to Luton Airport Parkway takes about 25 min, then the DART.",
            "Contactless works at Luton Airport Parkway; the DART is a separate charge. Wizz Air allows one free under-seat bag (40 × 30 × 20 cm), and the gate closes about 30 min before departure. Have your boarding pass ready in the Wizz app.",
          ],
          checks: ["Complete Wizz Air online check-in (it opens about 30 days before; airport check-in costs extra). Check the departure time on the morning in case of schedule changes."],
          sources: [{ label: "TfL Journey Planner", url: "https://tfl.gov.uk/plan-a-journey/" }, { label: "National Rail", url: "https://www.nationalrail.co.uk/" }],
        },
      ],
    },
  ],
};
