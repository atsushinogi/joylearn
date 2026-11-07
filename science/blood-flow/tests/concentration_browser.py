"""Regression tests for matching three labels to three of six shuffled diagrams."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL = os.environ.get('BLOOD_FLOW_TEST_URL', (Path(__file__).resolve().parents[1] / 'index.html').as_uri())
LABELS = [('pattern-a', '酸素'), ('pattern-b', '養分'), ('pattern-c', '不要物')]
DISTRACTORS = ['pattern-d', 'pattern-e', 'pattern-f']


def slot(page, diagram):
    return page.locator(f'.concentration-slot[data-diagram="{diagram}"]')


def chip(page, label, mobile=False):
    return page.locator('#concentration-mobile-bank' if mobile else '#concentration-bank').get_by_role('button', name=label, exact=True)


def order(page):
    return page.locator('.concentration-card').evaluate_all('cards => cards.map(card => card.dataset.diagram)')


def snapshot(page, name, full_page=True):
    directory = os.environ.get('BLOOD_FLOW_SCREENSHOT_DIR')
    if directory:
        Path(directory).mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(Path(directory) / name), full_page=full_page)


def tap_slot(page, diagram):
    slot(page, diagram).evaluate("element => element.scrollIntoView({block: 'center'})")
    slot(page, diagram).tap()


with sync_playwright() as p:
    browser = p.chromium.launch(args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1080}, reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(URL)
    page.get_by_role('button', name='肺静脈', exact=True).click()
    page.locator('.slot').nth(1).click()
    page.locator('#concentration-mode').click()
    expect(page.locator('.workspace')).not_to_be_visible()
    expect(page.locator('.concentration-card')).to_have_count(6)
    assert len(set(order(page))) == 6
    expect(page.locator('#concentration-bank .concentration-chip')).to_have_count(3)
    expect(page.locator('#concentration-count')).to_have_text('0 / 3')
    # Appearance updates every diagram, gradients, legend, and enlarged diagram.
    original_order = order(page)
    artery = page.locator('[data-diagram="pattern-a"] [data-vessel="aorta"]')
    green = artery.evaluate('element => getComputedStyle(element).stroke')
    page.get_by_role('button', name='青', exact=True).click()
    blue = artery.evaluate('element => getComputedStyle(element).stroke')
    assert blue != green
    assert page.locator('.concentration-card [data-level="3"]').evaluate_all('paths => new Set(paths.map(path => getComputedStyle(path).stroke)).size') == 1
    assert blue in page.locator('.density-legend i').evaluate('element => getComputedStyle(element).backgroundImage')
    assert page.locator('#pattern-a-lung stop').last.evaluate('element => getComputedStyle(element).stopColor') == blue
    contrast = page.locator('#concentration-contrast')
    contrast.focus()
    contrast.press('End')
    expect(page.locator('#concentration-contrast-value')).to_have_text('100%')
    strong = artery.evaluate('element => getComputedStyle(element).stroke')
    contrast.press('Home')
    expect(page.locator('#concentration-contrast-value')).to_have_text('20%')
    assert artery.evaluate('element => getComputedStyle(element).stroke') != strong
    walls = page.locator('.concentration-card .concentration-vessel-wall')
    wall_colors = walls.evaluate_all('paths => paths.map(path => getComputedStyle(path).stroke)')
    brightness = page.locator('#concentration-brightness')
    brightness.focus()
    brightness.press('Home')
    expect(page.locator('#concentration-brightness-value')).to_have_text('50%')
    dark_blood = artery.evaluate('element => getComputedStyle(element).stroke')
    brightness.press('End')
    expect(page.locator('#concentration-brightness-value')).to_have_text('150%')
    assert artery.evaluate('element => getComputedStyle(element).stroke') != dark_blood
    assert walls.evaluate_all('paths => paths.map(path => getComputedStyle(path).stroke)') == wall_colors
    page.locator('#concentration-color').evaluate("element => { element.value = '#df8b21'; element.dispatchEvent(new Event('input', {bubbles: true})); }")
    expect(page.locator('#concentration-color')).to_have_value('#df8b21')
    custom = artery.evaluate('element => getComputedStyle(element).stroke')
    assert custom != blue
    page.locator('[data-diagram="pattern-a"] .concentration-zoom').click()
    assert page.locator('#concentration-zoom-map [data-vessel="aorta"]').evaluate('element => getComputedStyle(element).stroke') == custom
    page.locator('#concentration-zoom-close').click()
    assert order(page) == original_order
    expect(page.locator('#concentration-count')).to_have_text('0 / 3')
    page.locator('#concentration-check').click()
    expect(page.locator('#concentration-feedback')).to_contain_text('0 / 3 正解')
    expect(page.locator('.concentration-card.correct')).to_have_count(0)

    # Three placed labels on distractor diagrams are all incorrect.
    for i, ((_, label), target) in enumerate(zip(LABELS, DISTRACTORS)):
        if i % 2:
            slot(page, target).click()
            chip(page, label).click()
        else:
            chip(page, label).click()
            slot(page, target).click()
    expect(page.locator('.concentration-slot.filled')).to_have_count(3)
    page.locator('#concentration-check').click()
    expect(page.locator('#concentration-feedback')).to_contain_text('0 / 3 正解')
    expect(page.locator('.concentration-card.wrong')).to_have_count(3)
    # Moving a used label empties its former diagram, so only three slots are filled.
    for target, label in LABELS:
        chip(page, label).click()
        slot(page, target).click()
    expect(page.locator('.concentration-slot.filled')).to_have_count(3)
    expect(page.locator('.concentration-card.correct')).to_have_count(0)
    for target in DISTRACTORS:
        expect(slot(page, target)).to_contain_text('ここに成分を入れる')
    page.locator('#concentration-check').click()
    expect(page.locator('#concentration-feedback')).to_contain_text('3つとも正解')
    before_appearance = page.locator('.concentration-slot-label').all_text_contents()
    page.get_by_role('button', name='赤', exact=True).click()
    page.locator('#concentration-brightness').focus()
    page.locator('#concentration-brightness').press('Home')
    assert page.locator('.concentration-slot-label').all_text_contents() == before_appearance
    assert order(page) == original_order
    expect(page.locator('#concentration-feedback')).to_contain_text('3つとも正解')
    for target in DISTRACTORS:
        expect(slot(page, target)).to_contain_text('空欄で正解')
    snapshot(page, 'concentration-correct.png')

    # Moving one used label onto another occupied diagram swaps the two labels.
    chip(page, '酸素').click()
    slot(page, 'pattern-b').click()
    expect(slot(page, 'pattern-b')).to_contain_text('酸素')
    expect(slot(page, 'pattern-a')).to_contain_text('養分')
    page.locator('#concentration-check').click()
    expect(page.locator('#concentration-feedback')).to_contain_text('1 / 3 正解')
    chip(page, '酸素').click()
    slot(page, 'pattern-a').click()
    page.locator('[data-diagram="pattern-a"] .concentration-remove').click()
    expect(page.locator('#concentration-count')).to_have_text('2 / 3')
    chip(page, '酸素').click()
    slot(page, 'pattern-a').click()
    slot(page, 'pattern-b').click()
    page.locator('#concentration-hint').click()
    expect(page.locator('[data-diagram="pattern-b"] .concentration-card-hint')).to_contain_text('門脈')
    page.keyboard.press('Escape')
    page.locator('.concentration-zoom').first.click()
    expect(page.locator('#concentration-zoom-dialog')).to_be_visible()
    assert page.evaluate("(() => { const ids = [...document.querySelectorAll('[id]')].map(element => element.id); return ids.length === new Set(ids).size; })()")
    snapshot(page, 'concentration-zoom.png', full_page=False)
    page.locator('#concentration-zoom-close').click()

    # Switching exercises preserves both the old name answer and this matching round.
    previous = order(page)
    page.locator('#quiz-mode').click()
    expect(page.locator('#progress-count')).to_have_text('1 / 8')
    page.locator('#description-mode').click()
    expect(page.locator('#progress-count')).to_have_text('0 / 6')
    page.locator('#concentration-mode').click()
    assert order(page) == previous
    expect(page.locator('#concentration-count')).to_have_text('3 / 3')
    for _ in range(6):
        page.locator('#concentration-next').click()
        assert order(page) != previous
        assert set(order(page)) == set(previous)
        previous = order(page)
        expect(page.locator('.concentration-slot.filled')).to_have_count(0)
        expect(page.locator('#concentration-count')).to_have_text('0 / 3')
    page.locator('#concentration-reveal').click()
    expect(page.locator('.concentration-slot.filled')).to_have_count(3)
    for target, label in LABELS:
        expect(slot(page, target)).to_contain_text(label)
    for target in DISTRACTORS:
        expect(slot(page, target)).to_contain_text('空欄で正解')
    expect(page.locator('#concentration-check')).to_be_disabled()
    page.locator('#concentration-next').click()
    page.set_viewport_size({'width': 1440, 'height': 1800})
    chip(page, '酸素').drag_to(slot(page, 'pattern-a'))
    expect(slot(page, 'pattern-a')).to_contain_text('酸素')
    snapshot(page, 'concentration-desktop.png')
    # Preferences persist across reloads and can be reset independently of a round.
    page.get_by_role('button', name='青', exact=True).click()
    page.locator('#concentration-contrast').focus()
    page.locator('#concentration-contrast').press('End')
    page.locator('#concentration-brightness').focus()
    page.locator('#concentration-brightness').press('End')
    page.reload()
    page.locator('#concentration-mode').click()
    expect(page.locator('#concentration-color')).to_have_value('#245da0')
    expect(page.locator('#concentration-contrast')).to_have_value('100')
    expect(page.locator('#concentration-brightness')).to_have_value('150')
    page.locator('#concentration-appearance-reset').click()
    expect(page.locator('#concentration-color')).to_have_value('#245f42')
    expect(page.locator('#concentration-contrast')).to_have_value('75')
    expect(page.locator('#concentration-brightness')).to_have_value('100')
    # Earlier saved color/contrast preferences acquire the default brightness.
    page.evaluate("localStorage.setItem('joylearn.blood-flow.concentration-appearance.v1', JSON.stringify({color: '#754b9e', contrast: 60}))")
    page.reload()
    page.locator('#concentration-mode').click()
    expect(page.locator('#concentration-color')).to_have_value('#754b9e')
    expect(page.locator('#concentration-contrast')).to_have_value('60')
    expect(page.locator('#concentration-brightness')).to_have_value('100')
    print('PASS: six diagrams, three correct profiles and three distractors, partial/full grading, move/swap/remove, hints, zoom, reveal, shuffle, drag, independent modes')
    print('PASS: colors, brightness/contrast controls, fixed outlines, legend/zoom, stable answers/order, saved preferences, old-preference migration and reset')

    context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, reduced_motion='reduce')
    phone = context.new_page()
    phone.on('pageerror', lambda error: errors.append(str(error)))
    phone.goto(URL)
    phone.locator('#concentration-mode').tap()
    expect(phone.locator('.concentration-mobile-bar')).to_be_visible()
    phone.get_by_role('button', name='グレー', exact=True).tap()
    expect(phone.locator('#concentration-color')).to_have_value('#505050')
    phone.locator('#concentration-contrast').focus()
    phone.locator('#concentration-contrast').press('End')
    phone_brightness = phone.locator('#concentration-brightness')
    phone_brightness.evaluate("element => element.scrollIntoView({block: 'center'})")
    bounds = phone_brightness.bounding_box()
    phone_brightness.tap(position={'x': bounds['width'] * 0.8, 'y': bounds['height'] / 2})
    assert int(phone_brightness.input_value()) > 100
    phone_brightness.press('End')
    expect(phone.locator('#concentration-brightness-value')).to_have_text('150%')
    tap_slot(phone, 'pattern-a')
    chip(phone, '酸素', mobile=True).tap()
    chip(phone, '養分', mobile=True).tap()
    tap_slot(phone, 'pattern-b')
    chip(phone, '不要物', mobile=True).tap()
    tap_slot(phone, 'pattern-e')
    phone.locator('#concentration-mobile-check').tap()
    expect(phone.locator('#concentration-mobile-feedback')).to_have_text('正解 2 / 3')
    chip(phone, '不要物', mobile=True).tap()
    tap_slot(phone, 'pattern-c')
    phone.locator('#concentration-mobile-check').tap()
    expect(phone.locator('#concentration-mobile-feedback')).to_have_text('正解 3 / 3')
    snapshot(phone, 'concentration-mobile.png', full_page=False)
    previous = order(phone)
    phone.locator('#concentration-mobile-next').tap()
    assert order(phone) != previous
    expect(phone.locator('.concentration-slot.filled')).to_have_count(0)
    for width in [320, 390, 600, 740, 768, 1024, 1440]:
        phone.set_viewport_size({'width': width, 'height': 844})
        assert phone.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Overflow at {width}px'
        for item in phone.locator('.concentration-slot').all():
            assert item.bounding_box()['height'] >= 44
    assert not errors, errors
    print('PASS: mobile tap placement, fixed choice bar, grading, shuffled restart, 320–1440px layouts, no browser errors')
    browser.close()
