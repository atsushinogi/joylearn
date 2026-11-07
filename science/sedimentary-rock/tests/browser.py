"""UI regression tests. Install Playwright and Chromium before running this file."""

import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
URL = os.environ.get("ROCK_TEST_URL", (ROOT / "index.html").as_uri())
SAMPLES = [
    ("mudstone", "デイ岩（泥岩）", "どろが固まってできた、きめの細かい岩石です。"),
    ("sandstone", "サ岩（砂岩）", "砂が固まってできた、灰色やうす茶色の岩石です。"),
    ("conglomerate", "レキ岩（礫岩）", "レキ（小石）が砂やどろといっしょに固まってできた岩石です。レキは角がとれて丸みをおびています。"),
    ("limestone", "セッカイ岩（石灰岩）", "貝やサンゴ、フズリナの死がいなどが堆積してできた岩石です。白や灰色のものが多く、塩酸にとけて二酸化炭素を出します。"),
    ("chert", "チャート", "ホウサンチュウの死がいなどが堆積してできた岩石です。白、緑、赤茶色のものが多く、とてもかたいので、昔は火打ち石として使われていました。"),
    ("tuff", "ギョウカイ岩（凝灰岩）", "火山灰などが固まってできた岩石で、灰色やうすい緑色のものが多く見られます。やわらかいが熱に強く、へいなどに使われます。"),
    ("marble", "大理石", "セッカイ岩がマグマの熱を受けてできます。建築材料や彫刻の材料として使われます。"),
    ("slate", "ネンバン岩（粘板岩）", "デイ岩が高い圧力によってさらにかたくなってできます。すずりの材料として使われます。"),
]


def field(page, kind, sample_id):
    return page.locator(f'.answer-field[data-kind="{kind}"][data-rock="{sample_id}"]')


def bank_choice(page, text, mobile=False):
    return page.locator("#mobile-bank" if mobile else "#choice-bank").get_by_role("button", name=text, exact=True)


def snapshot(page, name):
    directory = os.environ.get("ROCK_SCREENSHOT_DIR")
    if directory:
        Path(directory).mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(Path(directory) / name), full_page=True)


with sync_playwright() as p:
    browser = p.chromium.launch(args=["--no-sandbox"])
    page = browser.new_page(viewport={"width": 1440, "height": 1200}, reduced_motion="reduce")
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(URL)
    expect(page.locator(".specimen")).to_have_count(8)
    expect(page.locator(".answer-field")).to_have_count(16)
    assert page.locator(".photo-wrap > img").evaluate_all("images => images.every(img => img.complete && img.naturalWidth > 0)")
    page.locator("#check").click()
    expect(page.locator("#feedback")).to_contain_text("あと16か所")
    snapshot(page, "rocks-desktop-empty.png")

    # Names and descriptions can each be placed in either interaction order.
    for i, (sample_id, _, _) in enumerate(SAMPLES):
        source = SAMPLES[1 - i] if i < 2 else SAMPLES[i]
        if i % 2:
            page.locator('#quiz-controls [data-bank-kind="name"]').click()
            bank_choice(page, source[1]).click()
            field(page, "name", sample_id).click()
        else:
            field(page, "name", sample_id).click()
            bank_choice(page, source[1]).click()
    for sample_id, _, description in SAMPLES:
        field(page, "description", sample_id).click()
        bank_choice(page, description).click()
    page.locator("#check").click()
    expect(page.locator("#feedback")).to_contain_text("14 / 16 問正解")
    expect(page.locator(".name-field.wrong")).to_have_count(2)
    expect(page.locator(".description-field.correct")).to_have_count(8)
    # Reusing the correct name swaps the two occupied fields.
    field(page, "name", "mudstone").click()
    bank_choice(page, SAMPLES[0][1]).click()
    page.locator("#check").click()
    expect(page.locator("#feedback")).to_contain_text("16問すべて正解")
    expect(page.locator(".answer-field.correct")).to_have_count(16)
    snapshot(page, "rocks-desktop-correct.png")

    field(page, "name", "chert").click()
    page.locator("#clear-answer").click()
    expect(field(page, "name", "chert")).to_contain_text("名前を入れる")
    expect(field(page, "description", "chert")).to_contain_text(SAMPLES[4][2])
    expect(page.locator("#progress-count")).to_have_text("15 / 16")
    bank_choice(page, "チャート").click()
    page.locator("#check").click()
    expect(page.locator(".answer-field.correct")).to_have_count(16)

    page.locator("#learn-mode").click()
    expect(page.locator(".specimen-status", has_text="変成岩")).to_have_count(2)
    expect(page.locator(".specimen-status", has_text="堆積岩")).to_have_count(6)
    expect(page.locator(".answer-field:disabled")).to_have_count(16)
    for sample_id, name, description in SAMPLES:
        expect(field(page, "name", sample_id)).to_contain_text(name)
        expect(field(page, "description", sample_id)).to_contain_text(description)
    snapshot(page, "rocks-learning.png")
    page.locator("#return-to-quiz").click()
    expect(page.locator(".answer-field.correct")).to_have_count(16)
    page.locator("#reveal").click()
    expect(page.locator("#check")).to_be_disabled()
    page.locator("#reset").click()
    page.locator('#reset-dialog [data-close="reset-dialog"]').click()
    expect(page.locator("#check")).to_be_disabled()
    page.locator("#reset").click()
    page.locator("#reset-confirm").click()
    expect(page.locator(".answer-field.empty")).to_have_count(16)

    # Hint appears alongside the specimen as well as in the feedback panel.
    field(page, "description", "mudstone").click()
    page.locator("#hint").click()
    expect(page.locator("#specimen-mudstone .specimen-hint")).to_be_visible()
    expect(page.locator("#specimen-mudstone .specimen-hint")).to_contain_text("どろ")
    page.locator('#specimen-mudstone .zoom-button').click()
    expect(page.locator("#photo-title")).to_have_text("標本 01")
    page.wait_for_function("document.querySelector('#large-photo').naturalWidth > 0")
    page.locator('[data-close="photo-dialog"]').click()
    page.locator("#reference-open").click()
    page.wait_for_function("document.querySelector('#reference-dialog img').naturalWidth > 0")
    page.keyboard.press("Escape")
    expect(page.locator("#reference-dialog")).not_to_be_visible()

    page.set_viewport_size({"width": 1440, "height": 1800})
    page.locator('#quiz-controls [data-bank-kind="name"]').click()
    bank_choice(page, SAMPLES[0][1]).drag_to(field(page, "name", "mudstone"))
    expect(field(page, "name", "mudstone")).to_contain_text(SAMPLES[0][1])
    page.locator('#quiz-controls [data-bank-kind="description"]').click()
    bank_choice(page, SAMPLES[0][2]).drag_to(field(page, "name", "sandstone"))
    expect(field(page, "name", "sandstone")).to_contain_text("名前を入れる")
    bank_choice(page, SAMPLES[0][2]).drag_to(field(page, "description", "mudstone"))
    expect(field(page, "description", "mudstone")).to_contain_text(SAMPLES[0][2])
    print("PASS: eight source photos, 16-field grading, placement, swapping, clear, study, reveal, reset, hint, zoom, reference, typed drag-and-drop")

    context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, reduced_motion="reduce")
    phone = context.new_page()
    phone.on("pageerror", lambda error: errors.append(str(error)))
    phone.goto(URL)
    field(phone, "name", "mudstone").tap()
    expect(phone.locator("#choice-dialog")).to_be_visible()
    bank_choice(phone, SAMPLES[0][1], mobile=True).tap()
    expect(phone.locator("#choice-dialog")).not_to_be_visible()
    expect(field(phone, "name", "mudstone")).to_contain_text(SAMPLES[0][1])
    field(phone, "description", "mudstone").tap()
    bank_choice(phone, SAMPLES[4][2], mobile=True).tap()
    phone.locator("#mobile-check").tap()
    expect(phone.locator("#feedback")).to_contain_text("1 / 16 問正解")
    expect(field(phone, "description", "mudstone")).to_have_class("answer-field description-field filled wrong")
    phone.locator("#review").tap()
    expect(phone.locator("#choice-dialog")).to_be_visible()
    phone.locator('[data-close="choice-dialog"]').tap()
    field(phone, "description", "mudstone").tap()
    bank_choice(phone, SAMPLES[0][2], mobile=True).tap()
    phone.locator("#mobile-check").tap()
    expect(phone.locator("#feedback")).to_contain_text("2 / 16 問正解")
    phone.locator("#learn-mode").tap()
    expect(phone.locator(".answer-field:disabled")).to_have_count(16)
    phone.locator("#quiz-mode").tap()
    expect(phone.locator("#progress-count")).to_have_text("2 / 16")
    phone.locator("#mobile-pick").tap()
    phone.locator('.mobile-kind-tabs [data-bank-kind="name"]').tap()
    bank_choice(phone, SAMPLES[0][1], mobile=True).tap()
    field(phone, "name", "sandstone").tap()
    expect(field(phone, "name", "mudstone")).to_contain_text("名前を入れる")
    expect(field(phone, "name", "sandstone")).to_contain_text(SAMPLES[0][1])
    field(phone, "name", "sandstone").tap()
    phone.locator("#mobile-clear").tap()
    expect(phone.locator("#progress-count")).to_have_text("1 / 16")
    snapshot(phone, "rocks-mobile.png")
    for width in [320, 390, 768, 1024, 1280]:
        phone.set_viewport_size({"width": width, "height": 844})
        assert phone.evaluate("document.documentElement.scrollWidth <= innerWidth"), f"Overflow at {width}px"
        for item in phone.locator(".answer-field").all():
            assert item.bounding_box()["height"] >= 44
    assert not errors, errors
    print("PASS: mobile touch dialogs, name/description placement, grading, state preservation, clearing, 320–1280px layouts, no JavaScript errors")
    browser.close()
