// @ts-check
/**
 * The six anti-patterns, in talk order.
 *
 * `failMarkup` / `fixMarkup` are injected into <template> elements and cloned
 * into the live DOM on toggle, so the accessibility tree really changes —
 * a running screen reader re-reads the swapped node immediately.
 *
 * `failCode` / `fixCode` are what the audience reads. Keep them in sync with
 * the markup above them: if the code says it, the live demo must do it.
 *
 * @typedef {import('./highlight.mjs').Snippet} Snippet
 *
 * @typedef {object} Section
 * @property {string} id
 * @property {string} n
 * @property {string} title
 * @property {string} lede
 * @property {string} rule
 * @property {string[]} criteria
 * @property {string} tryIt
 * @property {string} failMarkup
 * @property {string} fixMarkup
 * @property {Snippet} failCode
 * @property {Snippet} fixCode
 */

/** @type {Section[]} */
export const sections = [
  {
    id: 'clickable-div',
    n: '01',
    title: 'The clickable div',
    lede: 'It looks like a button. It is styled like a button. The mouse agrees. Nothing else does.',
    rule: 'If it looks like a button, it has to be a button. Screen readers and keyboards only know what the code says, never what it looks like.',
    criteria: ['WCAG 4.1.2 Name, Role, Value', 'WCAG 2.1.1 Keyboard'],
    tryIt: 'Put focus in the demo and press Tab. In the broken state there is nothing to land on.',
    failMarkup: `
<div class="lab-card">
  <p class="lab-price">Semantic HTML sticker pack — $4</p>
  <div class="lab-btn lab-btn--fake" data-action="cart">Add to cart</div>
  <p class="lab-out">Cart: <output data-cart>0</output></p>
</div>`,
    fixMarkup: `
<div class="lab-card">
  <p class="lab-price">Semantic HTML sticker pack — $4</p>
  <button type="button" class="lab-btn" data-action="cart">Add to cart</button>
  <p class="lab-out">Cart: <output data-cart>0</output></p>
</div>`,
    failCode: {
      code: `<div class="btn" onclick="addToCart()">
  Add to cart
</div>`,
      notes: [
        { line: 1, text: 'No role, so a screen reader announces this as plain text — or skips it entirely.' },
        { line: 1, text: 'Not focusable: a div has no tabindex, so Tab walks straight past it.' },
        { line: 1, text: 'A click handler alone ignores Enter and Space, which is how buttons are operated without a mouse.' }
      ]
    },
    fixCode: {
      code: `<button type="button" class="btn">
  Add to cart
</button>`,
      notes: [
        { line: 1, text: 'Role, focusability, Enter and Space handling, and the disabled state all arrive free with the element.' },
        { line: 1, text: 'type="button" stops it submitting a surrounding form by accident.' }
      ]
    }
  },

  {
    id: 'alt-text',
    n: '02',
    title: 'Alt text that says nothing',
    lede: 'Every image gets an alt attribute. What goes inside it depends on whether the image carries information or just decorates.',
    rule: 'If you deleted the image, what sentence would you write in its place? That sentence is your alt text. If you would write nothing, use alt="".',
    criteria: ['WCAG 1.1.1 Non-text Content'],
    tryIt: 'The filename version is not a missing alt — it is worse. It is noise a screen reader has to read out loud.',
    failMarkup: `
<figure class="lab-figure">
  <img src="/img/sneaker.svg" width="220" height="150" alt="IMG_2847_final_v3.png">
  <img src="/img/flourish.svg" width="220" height="18" alt="decorative swirl divider graphic image">
  <figcaption class="lab-caption">Court High 84 — $120</figcaption>
</figure>`,
    fixMarkup: `
<figure class="lab-figure">
  <img src="/img/sneaker.svg" width="220" height="150" alt="Blue high-top sneaker with a white sole, side view">
  <img src="/img/flourish.svg" width="220" height="18" alt="">
  <figcaption class="lab-caption">Court High 84 — $120</figcaption>
</figure>`,
    failCode: {
      code: `<img src="hero.png" alt="IMG_2847_final_v3.png">

<img src="swirl.svg"
     alt="decorative swirl divider graphic image">`,
      notes: [
        { line: 1, text: 'A filename describes your export settings, not the picture. It tells the listener nothing.' },
        { line: 3, text: 'Decoration announced out loud is clutter. "Image" is also redundant — the screen reader already said "graphic".' }
      ]
    },
    fixCode: {
      code: `<img src="hero.png"
     alt="Blue high-top sneaker with a white sole, side view">

<img src="swirl.svg" alt="">`,
      notes: [
        { line: 2, text: 'Describes what a sighted person gets from the image, in the length of a caption.' },
        { line: 4, text: 'An empty alt is a decision, not an omission: it tells assistive tech to skip this one on purpose.' }
      ]
    }
  },

  {
    id: 'heading-levels',
    n: '03',
    title: 'Levels of heading',
    lede: 'Nearly 30 million headings on a million home pages — 29.9 each, up 20.4% in a year. More headings only help if the outline is true.',
    rule: 'Headings are the map, not the type scale. If it looks like a heading, it has to be a heading, at the next level down — never the one that happens to look the right size.',
    criteria: ['WCAG 1.3.1 Info and Relationships', 'WCAG 2.4.6 Headings and Labels'],
    tryIt: 'Tab through the example. The fake title is skipped — it is a paragraph. Then the outline jumps 4, 6, 3. A screen reader headings list (VoiceOver rotor, NVDA Insert+F7) shows the same gaps.',
    failMarkup: `
<div class="lab-outline" data-headingsource>
  <p class="lab-fakehead">DevFest 2026</p>
  <h4>Schedule</h4>
  <p>Friday talks, Saturday workshops.</p>
  <h6>Venue</h6>
  <p>City library, main hall. <a href="#heading-levels">Get directions</a></p>
  <h3>Get tickets</h3>
  <p><a href="#heading-levels">Register for DevFest</a></p>
</div>`,
    fixMarkup: `
<div class="lab-outline" data-headingsource>
  <h2>DevFest 2026</h2>
  <h3>Schedule</h3>
  <p>Friday talks, Saturday workshops.</p>
  <h3>Venue</h3>
  <p>City library, main hall. <a href="#heading-levels">Get directions</a></p>
  <h3>Get tickets</h3>
  <p><a href="#heading-levels">Register for DevFest</a></p>
</div>`,
    failCode: {
      code: `<p class="hero">DevFest 2026</p>

<h4>Schedule</h4>

<h6>Venue</h6>

<h3>Get tickets</h3>`,
      notes: [
        { line: 1, text: 'Looks like the page title. The headings list never sees it — it is a paragraph.' },
        { line: 3, text: 'h4 because it looked medium-small. Nothing sits above it, so the outline skips two levels.' },
        { line: 5, text: 'h6 as a size token. Almost every home page that uses one also skips levels — this is type size, not a sixth level of structure.' }
      ]
    },
    fixCode: {
      code: `<h2>DevFest 2026</h2>
<h3>Schedule</h3>
<h3>Venue</h3>
<h3>Get tickets</h3>`,
      notes: [
        { line: 1, text: 'A real heading. Screen reader users jump here first, the way sighted users look at the big type.' },
        { line: 2, text: 'Siblings share a level. Do not pick h4 or h6 because they look smaller — that is CSS, not structure.' }
      ]
    }
  },

  {
    id: 'focus-visible',
    n: '04',
    title: 'The invisible cursor',
    lede: 'Someone removed the focus outline because it looked ugly on one button. Now nobody navigating by keyboard can tell where they are.',
    rule: 'Never remove a focus outline without replacing it with something at least as visible. If you cannot see where you are, neither can the person using only a keyboard.',
    criteria: ['WCAG 2.4.7 Focus Visible', 'WCAG 2.4.11 Focus Not Obscured'],
    tryIt: 'Tab through this row in both states. Same tab order, same elements — only one of them tells you anything.',
    failMarkup: `
<nav class="lab-nav lab-nav--noring" aria-label="Demo navigation, broken focus">
  <a href="#focus-visible">Schedule</a>
  <a href="#focus-visible">Speakers</a>
  <a href="#focus-visible">Venue</a>
  <button type="button" class="lab-btn" data-action="noop">Register</button>
</nav>`,
    fixMarkup: `
<nav class="lab-nav lab-nav--ring" aria-label="Demo navigation, visible focus">
  <a href="#focus-visible">Schedule</a>
  <a href="#focus-visible">Speakers</a>
  <a href="#focus-visible">Venue</a>
  <button type="button" class="lab-btn" data-action="noop">Register</button>
</nav>`,
    failCode: {
      lang: 'css',
      code: `a,
button {
  outline: none;
}`,
      notes: [
        { line: 3, text: 'Nothing replaces it, so keyboard focus becomes invisible across the entire page.' },
        { line: 3, text: 'This is usually copied in to hide the ring on mouse click — :focus-visible already does that for you.' }
      ]
    },
    fixCode: {
      lang: 'css',
      code: `a:focus-visible,
button:focus-visible {
  outline: 3px solid #ffffff;
  outline-offset: 2px;
  box-shadow: 0 0 0 6px #0e1420;
}`,
      notes: [
        { line: 1, text: ':focus-visible fires for keyboard focus and stays quiet for mouse clicks — the behaviour people actually wanted.' },
        { line: 5, text: 'A second ring in the opposite tone keeps the indicator visible on light and dark backgrounds alike.' }
      ]
    }
  },

  {
    id: 'link-text',
    n: '05',
    title: 'Click here, click here, click here',
    lede: 'Screen reader users pull up a list of every link on the page to navigate it. Out of context, most link text collapses into noise.',
    rule: 'Link text has to make sense with the sentence around it removed. Read the links on their own — if you cannot tell them apart, neither can anyone else.',
    criteria: ['WCAG 2.4.4 Link Purpose', 'WCAG 2.4.9 Link Purpose, Link Only'],
    tryIt: 'Open the links list in VoiceOver or NVDA. Out of context, these three links all say nothing useful.',
    failMarkup: `
<div class="lab-prose" data-linksource>
  <p>Registration for DevFest closes Friday. <a href="#link-text">Click here</a> to sign up.</p>
  <p>The full schedule is posted. <a href="#link-text">Read more</a>.</p>
  <p>Travel grants are available. <a href="#link-text">Learn more</a>.</p>
</div>`,
    fixMarkup: `
<div class="lab-prose" data-linksource>
  <p>Registration for DevFest closes Friday. <a href="#link-text">Register for DevFest</a>.</p>
  <p><a href="#link-text">View the full schedule</a> for all three tracks.</p>
  <p><a href="#link-text">Apply for a travel grant</a> before 30 October.</p>
</div>`,
    failCode: {
      code: `<p>Registration closes Friday.
   <a href="/register">Click here</a> to sign up.</p>

<p>The schedule is posted.
   <a href="/schedule">Read more</a>.</p>`,
      notes: [
        { line: 2, text: '"Click here" describes the mouse, not the destination — and the destination is the only useful part.' },
        { line: 5, text: 'Three links reading "read more" are indistinguishable in a links list, in search results, and on a phone.' }
      ]
    },
    fixCode: {
      code: `<p>Registration closes Friday.
   <a href="/register">Register for DevFest</a>.</p>

<p><a href="/schedule">View the full schedule</a>
   for all three tracks.</p>`,
      notes: [
        { line: 2, text: 'The link says where it goes, so it survives being read on its own.' },
        { line: 4, text: 'Front-loading the verb also makes the sentence shorter. Accessible copy is usually just better copy.' }
      ]
    }
  },

  {
    id: 'form-labels',
    n: '06',
    title: 'A form with no labels',
    lede: 'Placeholder text looks like a label until you start typing and it vanishes — taking the only instruction with it.',
    rule: 'Every input needs a real label a screen reader can announce. Placeholder text is a hint, not a label, and it disappears the moment it is needed.',
    criteria: ['WCAG 1.3.1 Info and Relationships', 'WCAG 3.3.2 Labels or Instructions'],
    tryIt: 'Tab into each field. The broken version announces "edit text" three times with no way to tell them apart.',
    failMarkup: `
<form class="lab-form" data-demo-form novalidate>
  <div class="lab-fakelabel">Full name</div>
  <input type="text" placeholder="Full name">
  <div class="lab-fakelabel">Email</div>
  <input type="text" placeholder="you@example.com">
  <p class="lab-hint lab-hint--coloronly">* Required</p>
  <button type="submit" class="lab-btn">Sign up</button>
  <p class="lab-status" data-form-status></p>
</form>`,
    fixMarkup: `
<form class="lab-form" data-demo-form novalidate>
  <label for="demo-name">Full name</label>
  <input type="text" id="demo-name" name="name" autocomplete="name" required>
  <label for="demo-email">Email</label>
  <input type="email" id="demo-email" name="email" autocomplete="email"
         aria-describedby="demo-email-hint" required>
  <p class="lab-hint" id="demo-email-hint">We send one confirmation and nothing else.</p>
  <button type="submit" class="lab-btn">Sign up</button>
  <p class="lab-status" data-form-status role="status"></p>
</form>`,
    failCode: {
      code: `<div class="label">Email</div>
<input type="text" placeholder="you@example.com">

<p class="hint">* Required</p>`,
      notes: [
        { line: 1, text: 'A styled div is not a label. Nothing connects it to the input, so it is never announced with the field.' },
        { line: 2, text: 'Placeholder-only fields announce as "edit text" and the hint disappears as soon as typing starts.' },
        { line: 4, text: 'Required is signalled by a red asterisk alone — colour carrying meaning on its own fails 1.4.1.' }
      ]
    },
    fixCode: {
      code: `<label for="email">Email</label>
<input type="email" id="email" name="email"
       autocomplete="email"
       aria-describedby="email-hint" required>

<p id="email-hint">We send one confirmation
   and nothing else.</p>`,
      notes: [
        { line: 1, text: 'for and id pair them up, so the label is announced with the field and clicking the label focuses it.' },
        { line: 3, text: 'autocomplete lets the browser fill it in — a genuine accessibility win under 1.3.5, not just convenience.' },
        { line: 4, text: 'required is announced as a state, and aria-describedby attaches the hint without crowding the label.' }
      ]
    }
  }
];
