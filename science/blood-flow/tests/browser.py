"""Behavior and responsive-layout regression tests; requires Playwright Chromium."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

SOURCE_NOTES = [
    ('肺動脈', '二酸化炭素が多く酸素が少ない。'),
    ('肺静脈', '酸素が多く二酸化炭素が少ない。'),
    ('肝静脈', 'ほぼ一定の養分がふくまれる。'),
    ('門脈', '食後、養分が最も多い。'),
    ('腎静脈', '不要なものが最も少ない。'),
    ('腎動脈', '不要なものが多い。'),
]
url = os.environ.get('BLOOD_FLOW_TEST_URL', (Path(__file__).resolve().parents[1] / 'index.html').as_uri())

with sync_playwright() as p:
    browser = p.chromium.launch(args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1080}, reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(url)
    # Start the name exercise, then verify the two rounds do not overwrite each other.
    page.get_by_role('button', name='肺静脈', exact=True).click()
    page.locator('.slot').nth(1).click()
    page.locator('#description-mode').click()
    expect(page.locator('#progress-count')).to_have_text('0 / 6')
    expect(page.locator('.description-slot')).to_have_count(6)
    expect(page.locator('#name-bank .name-chip')).to_have_count(6)
    assert set(page.locator('#name-bank .name-chip').all_text_contents()) == {note for _, note in SOURCE_NOTES}
    page.locator('#check').click()
    expect(page.locator('#feedback')).to_contain_text('あと6か所')
    page.locator('#hint').click()
    expect(page.locator('#feedback')).to_contain_text('肺動脈の解説のヒント')
    page.keyboard.press('Escape')

    # Place two explanations in the opposite slots and four in the right slots.
    for i, (_, text) in enumerate([SOURCE_NOTES[1], SOURCE_NOTES[0], *SOURCE_NOTES[2:]]):
        if i % 2:
            page.locator('.description-slot').nth(i).click()
            page.get_by_role('button', name=text, exact=True).click()
        else:
            page.get_by_role('button', name=text, exact=True).click()
            page.locator('.description-slot').nth(i).click()
    page.locator('#check').click()
    expect(page.locator('#feedback')).to_contain_text('4 / 6 問正解')
    expect(page.locator('.description-slot.wrong')).to_have_count(2)
    page.get_by_role('button', name=SOURCE_NOTES[0][1], exact=True).click()
    page.locator('.description-slot').nth(0).click()
    page.locator('#check').click()
    expect(page.locator('#feedback')).to_contain_text('全問正解')
    expect(page.locator('.description-slot.correct')).to_have_count(6)
    expect(page.locator('.workspace .progress-track')).to_have_attribute('aria-valuemax', '6')

    # Each description remains under its vessel name with no overlap at desktop size.
    for i, note in enumerate(page.locator('.description-slot').all()):
        rect = note.bounding_box()
        name = page.locator('.slot').nth([0, 1, 4, 5, 6, 7][i]).bounding_box()
        assert rect['y'] >= name['y'] + name['height'] - 1
        if i == 0:
            next_name = page.locator('.slot').nth(2).bounding_box()
            assert rect['y'] + rect['height'] <= next_name['y']

    page.locator('#quiz-mode').click()
    expect(page.locator('#progress-count')).to_have_text('1 / 8')
    expect(page.locator('.slot').nth(1)).to_contain_text('肺静脈')
    page.locator('#description-mode').click()
    expect(page.locator('.description-slot.correct')).to_have_count(6)
    page.locator('#learn-mode').click()
    for i, (_, text) in enumerate(SOURCE_NOTES):
        expect(page.locator('.description-slot').nth(i)).to_contain_text(text)
    page.locator('.description-slot').nth(3).click()
    expect(page.locator('#detail-name')).to_have_text('門脈')
    page.locator('#description-mode').click()
    page.locator('#show-answers').click()
    expect(page.locator('#check')).to_be_disabled()
    page.locator('#quiz-mode').click()
    expect(page.locator('#check')).to_be_enabled()
    expect(page.locator('#progress-count')).to_have_text('1 / 8')
    page.locator('#description-mode').click()
    page.locator('#reset').click()
    page.locator('#reset-cancel').click()
    expect(page.locator('#check')).to_be_disabled()
    page.locator('#reset').click()
    page.locator('#reset-confirm').click()
    expect(page.locator('.description-slot.empty')).to_have_count(6)
    page.set_viewport_size({'width': 1440, 'height': 1500})
    page.get_by_role('button', name=SOURCE_NOTES[5][1], exact=True).drag_to(page.locator('.description-slot').nth(5))
    expect(page.locator('.description-slot').nth(5)).to_contain_text(SOURCE_NOTES[5][1])
    page.locator('#quiz-mode').click()
    expect(page.locator('#progress-count')).to_have_text('1 / 8')
    print('PASS: six exact image descriptions, placement both ways, swapping, grading, hint, reveal, reset, drag, independent exercise state, learning mode')

    context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, reduced_motion='reduce')
    phone = context.new_page()
    phone.on('pageerror', lambda error: errors.append(str(error)))
    phone.goto(url)
    phone.locator('#description-mode').tap()
    phone.get_by_role('button', name=SOURCE_NOTES[3][1], exact=True).tap()
    phone.locator('.description-slot').nth(3).tap()
    expect(phone.locator('.description-slot').nth(3)).to_contain_text(SOURCE_NOTES[3][1])
    phone.locator('.description-slot').nth(5).tap()
    phone.get_by_role('button', name=SOURCE_NOTES[5][1], exact=True).tap()
    phone.locator('#check').tap()
    expect(phone.locator('#feedback')).to_contain_text('2 / 6 問正解')
    for width in [390, 320, 768, 1000]:
        phone.set_viewport_size({'width': width, 'height': 844})
        assert phone.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Overflow at {width}px'
        for slot in phone.locator('.description-slot').all():
            assert slot.bounding_box()['height'] >= 44
        # Percentage name positions must stay within the diagram, above the mobile list.
        figure = phone.locator('.diagram-figure').bounding_box()
        last_name = phone.locator('.slot').nth(7).bounding_box()
        assert last_name['y'] + last_name['height'] < figure['y'] + figure['height']
    assert not errors, errors
    print('PASS: touch placement, 320/390/768/1000px layouts, readable targets, no browser errors')
    browser.close()
