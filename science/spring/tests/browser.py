"""Browser regression checks. Requires Python Playwright and Chromium."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = Path(os.environ.get('SPRING_SCREENSHOT_DIR', '/tmp/spring-qa'))
OUTPUT.mkdir(parents=True, exist_ok=True)
URL = os.environ.get('SPRING_TEST_URL', (ROOT / 'index.html').as_uri())

SPY = """
(() => {
  let api;
  Object.defineProperty(window, 'SpringQuiz', {
    configurable: true,
    get() { return api; },
    set(value) {
      api = {...value, createQuestion(...args) {
        const q = value.createQuestion(...args);
        window.testQuestion = q;
        return q;
      }};
    }
  });
})();
"""


def question(page):
    return page.evaluate('window.testQuestion')


def assert_no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Horizontal overflow'


with sync_playwright() as p:
    browser = p.chromium.launch(args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 1440, 'height': 1100}, reduced_motion='reduce')
    context.add_init_script(SPY)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(URL)
    expect(page.locator('.choice')).to_have_count(4)
    expect(page.locator('#feedback')).not_to_be_visible()
    expect(page.locator('#next')).not_to_be_visible()
    page.screenshot(path=str(OUTPUT / 'desktop.png'), full_page=True)

    # Every type renders and grades, with a mixture of right and wrong answers.
    sources_seen = set()
    original_signatures = {}
    for i in range(24):
        q = question(page)
        original_signatures[q['id']] = q['signature']
        sources_seen.add(q['source'])
        expect(page.locator('#topic')).to_have_text(q['title'])
        outside = page.locator('#diagram text').evaluate_all('''texts => texts.map(t => ({text: t.textContent, box: t.getBBox()})).filter(t => t.box.x < 0 || t.box.y < 0 || t.box.x + t.box.width > 440 || t.box.y + t.box.height > 320).map(t => t.text)''')
        assert not outside, f'Clipped text in {q["id"]}: {outside}'
        correct_index = q['options'].index(q['answer'])
        index = (correct_index + 1) % 4 if i % 3 == 0 else correct_index
        page.locator('.choice').nth(index).click()
        expect(page.locator('#feedback')).to_be_visible()
        expect(page.locator('.choice.correct')).to_have_count(1)
        expect(page.locator('.choice:disabled')).to_have_count(4)
        score_before = page.locator('#score').inner_text()
        page.locator('.choice').nth(index).dispatch_event('click')
        assert page.locator('#score').inner_text() == score_before, 'Double counting'
        assert_no_overflow(page)
        page.screenshot(path=str(OUTPUT / f'{i + 1:02}-{q["id"]}.png'), full_page=True)
        if q['id'] == 'water':
            page.locator('#open-reference').click()
            expect(page.locator('#reference-dialog')).to_be_visible()
            page.wait_for_function('document.querySelector("#reference-image").naturalWidth > 0')
            page.keyboard.press('Escape')
            expect(page.locator('#reference-dialog')).not_to_be_visible()
        page.locator('#next').click()
    assert len(sources_seen) == 19
    expect(page.locator('#results')).to_be_visible()
    expect(page.locator('#result-score')).to_contain_text('16 / 24')
    expect(page.locator('#review-list details')).to_have_count(8)
    page.locator('#review-list summary').first.click()
    expect(page.locator('#review-list p').first).to_be_visible()
    page.locator('#retry-wrong').click()
    expect(page.locator('#question-count')).to_have_text('QUESTION 01 / 8')
    for _ in range(8):
        q = question(page)
        assert q['signature'] != original_signatures[q['id']], 'Retry reused original numbers'
        page.locator('.choice').nth(q['options'].index(q['answer'])).click()
        page.locator('#next').click()
    expect(page.locator('#result-score')).to_contain_text('8 / 8')
    expect(page.locator('#retry-wrong')).not_to_be_visible()
    print('PASS: all 24 types, 19 figure groups, immediate grading, answer lock, explanations, results and retry')

    # Course selection, restart and all source image navigation.
    page.locator('[data-course="spring"]').click()
    expect(page.locator('#question-count')).to_have_text('QUESTION 01 / 11')
    initial = question(page)['signature']
    page.locator('#restart').click()
    assert question(page)['signature'] != initial
    page.locator('[data-course="buoyancy"]').click()
    expect(page.locator('#question-count')).to_have_text('QUESTION 01 / 13')
    for source_index in range(19):
        page.locator('#open-library').click()
        expect(page.locator('.library-card')).to_have_count(19)
        page.locator('.library-card').nth(source_index).click()
        page.locator('#open-reference').click()
        page.wait_for_function('document.querySelector("#reference-image").complete && document.querySelector("#reference-image").naturalWidth > 0')
        page.locator('#reference-dialog .close-dialog').click()
    page.locator('#open-library').click()
    for image in page.locator('.library-card img').all():
        image.scroll_into_view_if_needed()
        expect(image).to_have_js_property('complete', True)
        assert image.evaluate('(img) => img.naturalWidth > 0')
    page.keyboard.press('Escape')
    print('PASS: both topic courses, new numbers on restart, 19 reference assets and library navigation')

    # Keyboard grading and phone touch behavior; check every diagram at 320px.
    page.locator('[data-course="all"]').click()
    page.locator('.choice').first.focus()
    page.keyboard.press('Enter')
    expect(page.locator('#feedback')).to_be_visible()
    phone_context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, reduced_motion='reduce')
    phone_context.add_init_script(SPY)
    phone = phone_context.new_page()
    phone.on('pageerror', lambda error: errors.append(str(error)))
    phone.goto(URL)
    phone.screenshot(path=str(OUTPUT / 'mobile.png'), full_page=True)
    phone.set_viewport_size({'width': 320, 'height': 740})
    for i in range(24):
        q = question(phone)
        assert_no_overflow(phone)
        for button in phone.locator('.choice').all():
            assert button.bounding_box()['height'] >= 44
        phone.locator('.choice').nth(q['options'].index(q['answer'])).tap()
        expect(phone.locator('#feedback')).to_be_visible()
        if q['id'] in ['scale-half', 'release']:
            phone.screenshot(path=str(OUTPUT / f'mobile-{q["id"]}.png'), full_page=True)
        phone.locator('#next').tap()
    expect(phone.locator('#result-score')).to_contain_text('24 / 24')
    assert not errors, errors
    print('PASS: keyboard selection, 24 touch answers, 320px and 390px layouts, no JavaScript errors')
    browser.close()
