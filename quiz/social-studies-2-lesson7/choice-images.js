/* WebP icons by original question and option positions, before shuffling.
 * Keep each row in the same order as quiz-data.js. Literal paths also
 * let ftp-sync.py include all 200 images in its upload preview.
 */
const CHOICE_IMAGES = [
  // Question 1
  ["images-sdxl-148-webp/q01_a.webp", "images-sdxl-148-webp/q01_b.webp", "images-sdxl-148-webp/q01_c.webp", "images-sdxl-148-webp/q01_d.webp"],
  // Question 2
  ["images-sdxl-148-webp/q02_a.webp", "images-sdxl-148-webp/q02_b.webp", "images-sdxl-148-webp/q02_c.webp", "images-sdxl-148-webp/q02_d.webp"],
  // Question 3
  ["images-sdxl-148-webp/q03_a.webp", "images-sdxl-148-webp/q03_b.webp", "images-sdxl-148-webp/q03_c.webp", "images-sdxl-148-webp/q03_d.webp"],
  // Question 4
  ["images-sdxl-148-webp/q04_a.webp", "images-sdxl-148-webp/q04_b.webp", "images-sdxl-148-webp/q04_c.webp", "images-sdxl-148-webp/q04_d.webp"],
  // Question 5
  ["images-sdxl-148-webp/q05_a.webp", "images-sdxl-148-webp/q05_b.webp", "images-sdxl-148-webp/q05_c.webp", "images-sdxl-148-webp/q05_d.webp"],
  // Question 6
  ["images-sdxl-148-webp/q06_a.webp", "images-sdxl-148-webp/q06_b.webp", "images-sdxl-148-webp/q06_c.webp", "images-sdxl-148-webp/q06_d.webp"],
  // Question 7
  ["images-sdxl-148-webp/q07_a.webp", "images-sdxl-148-webp/q07_b.webp", "images-sdxl-148-webp/q07_c.webp", "images-sdxl-148-webp/q07_d.webp"],
  // Question 8
  ["images-sdxl-148-webp/q08_a.webp", "images-sdxl-148-webp/q08_b.webp", "images-sdxl-148-webp/q08_c.webp", "images-sdxl-148-webp/q08_d.webp"],
  // Question 9
  ["images-sdxl-148-webp/q09_a.webp", "images-sdxl-148-webp/q09_b.webp", "images-sdxl-148-webp/q09_c.webp", "images-sdxl-148-webp/q09_d.webp"],
  // Question 10
  ["images-sdxl-148-webp/q10_a.webp", "images-sdxl-148-webp/q10_b.webp", "images-sdxl-148-webp/q10_c.webp", "images-sdxl-148-webp/q10_d.webp"],
  // Question 11
  ["images-sdxl-148-webp/q11_a.webp", "images-sdxl-148-webp/q11_b.webp", "images-sdxl-148-webp/q11_c.webp", "images-sdxl-148-webp/q11_d.webp"],
  // Question 12
  ["images-sdxl-148-webp/q12_a.webp", "images-sdxl-148-webp/q12_b.webp", "images-sdxl-148-webp/q12_c.webp", "images-sdxl-148-webp/q12_d.webp"],
  // Question 13
  ["images-sdxl-148-webp/q13_a.webp", "images-sdxl-148-webp/q13_b.webp", "images-sdxl-148-webp/q13_c.webp", "images-sdxl-148-webp/q13_d.webp"],
  // Question 14
  ["images-sdxl-148-webp/q14_a.webp", "images-sdxl-148-webp/q14_b.webp", "images-sdxl-148-webp/q14_c.webp", "images-sdxl-148-webp/q14_d.webp"],
  // Question 15
  ["images-sdxl-148-webp/q15_a.webp", "images-sdxl-148-webp/q15_b.webp", "images-sdxl-148-webp/q15_c.webp", "images-sdxl-148-webp/q15_d.webp"],
  // Question 16
  ["images-sdxl-148-webp/q16_a.webp", "images-sdxl-148-webp/q16_b.webp", "images-sdxl-148-webp/q16_c.webp", "images-sdxl-148-webp/q16_d.webp"],
  // Question 17
  ["images-sdxl-148-webp/q17_a.webp", "images-sdxl-148-webp/q17_b.webp", "images-sdxl-148-webp/q17_c.webp", "images-sdxl-148-webp/q17_d.webp"],
  // Question 18
  ["images-sdxl-148-webp/q18_a.webp", "images-sdxl-148-webp/q18_b.webp", "images-sdxl-148-webp/q18_c.webp", "images-sdxl-148-webp/q18_d.webp"],
  // Question 19
  ["images-sdxl-148-webp/q19_a.webp", "images-sdxl-148-webp/q19_b.webp", "images-sdxl-148-webp/q19_c.webp", "images-sdxl-148-webp/q19_d.webp"],
  // Question 20
  ["images-sdxl-148-webp/q20_a.webp", "images-sdxl-148-webp/q20_b.webp", "images-sdxl-148-webp/q20_c.webp", "images-sdxl-148-webp/q20_d.webp"],
  // Question 21
  ["images-sdxl-148-webp/q21_a.webp", "images-sdxl-148-webp/q21_b.webp", "images-sdxl-148-webp/q21_c.webp", "images-sdxl-148-webp/q21_d.webp"],
  // Question 22
  ["images-sdxl-148-webp/q22_a.webp", "images-sdxl-148-webp/q22_b.webp", "images-sdxl-148-webp/q22_c.webp", "images-sdxl-148-webp/q22_d.webp"],
  // Question 23
  ["images-sdxl-148-webp/q23_a.webp", "images-sdxl-148-webp/q23_b.webp", "images-sdxl-148-webp/q23_c.webp", "images-sdxl-148-webp/q23_d.webp"],
  // Question 24
  ["images-sdxl-148-webp/q24_a.webp", "images-sdxl-148-webp/q24_b.webp", "images-sdxl-148-webp/q24_c.webp", "images-sdxl-148-webp/q24_d.webp"],
  // Question 25
  ["images-sdxl-148-webp/q25_a.webp", "images-sdxl-148-webp/q25_b.webp", "images-sdxl-148-webp/q25_c.webp", "images-sdxl-148-webp/q25_d.webp"],
  // Question 26
  ["images-sdxl-148-webp/q26_a.webp", "images-sdxl-148-webp/q26_b.webp", "images-sdxl-148-webp/q26_c.webp", "images-sdxl-148-webp/q26_d.webp"],
  // Question 27
  ["images-sdxl-148-webp/q27_a.webp", "images-sdxl-148-webp/q27_b.webp", "images-sdxl-148-webp/q27_c.webp", "images-sdxl-148-webp/q27_d.webp"],
  // Question 28
  ["images-sdxl-148-webp/q28_a.webp", "images-sdxl-148-webp/q28_b.webp", "images-sdxl-148-webp/q28_c.webp", "images-sdxl-148-webp/q28_d.webp"],
  // Question 29
  ["images-sdxl-148-webp/q29_a.webp", "images-sdxl-148-webp/q29_b.webp", "images-sdxl-148-webp/q29_c.webp", "images-sdxl-148-webp/q29_d.webp"],
  // Question 30
  ["images-sdxl-148-webp/q30_a.webp", "images-sdxl-148-webp/q30_b.webp", "images-sdxl-148-webp/q30_c.webp", "images-sdxl-148-webp/q30_d.webp"],
  // Question 31
  ["images-sdxl-148-webp/q31_a.webp", "images-sdxl-148-webp/q31_b.webp", "images-sdxl-148-webp/q31_c.webp", "images-sdxl-148-webp/q31_d.webp"],
  // Question 32
  ["images-sdxl-148-webp/q32_a.webp", "images-sdxl-148-webp/q32_b.webp", "images-sdxl-148-webp/q32_c.webp", "images-sdxl-148-webp/q32_d.webp"],
  // Question 33
  ["images-sdxl-148-webp/q33_a.webp", "images-sdxl-148-webp/q33_b.webp", "images-sdxl-148-webp/q33_c.webp", "images-sdxl-148-webp/q33_d.webp"],
  // Question 34
  ["images-sdxl-148-webp/q34_a.webp", "images-sdxl-148-webp/q34_b.webp", "images-sdxl-148-webp/q34_c.webp", "images-sdxl-148-webp/q34_d.webp"],
  // Question 35
  ["images-sdxl-148-webp/q35_a.webp", "images-sdxl-148-webp/q35_b.webp", "images-sdxl-148-webp/q35_c.webp", "images-sdxl-148-webp/q35_d.webp"],
  // Question 36
  ["images-sdxl-148-webp/q36_a.webp", "images-sdxl-148-webp/q36_b.webp", "images-sdxl-148-webp/q36_c.webp", "images-sdxl-148-webp/q36_d.webp"],
  // Question 37
  ["images-sdxl-148-webp/q37_a.webp", "images-sdxl-148-webp/q37_b.webp", "images-sdxl-148-webp/q37_c.webp", "images-sdxl-148-webp/q37_d.webp"],
  // Question 38
  ["images-sdxl-148-webp/q38_a.webp", "images-sdxl-148-webp/q38_b.webp", "images-sdxl-148-webp/q38_c.webp", "images-sdxl-148-webp/q38_d.webp"],
  // Question 39
  ["images-sdxl-148-webp/q39_a.webp", "images-sdxl-148-webp/q39_b.webp", "images-sdxl-148-webp/q39_c.webp", "images-sdxl-148-webp/q39_d.webp"],
  // Question 40
  ["images-sdxl-148-webp/q40_a.webp", "images-sdxl-148-webp/q40_b.webp", "images-sdxl-148-webp/q40_c.webp", "images-sdxl-148-webp/q40_d.webp"],
  // Question 41
  ["images-sdxl-148-webp/q41_a.webp", "images-sdxl-148-webp/q41_b.webp", "images-sdxl-148-webp/q41_c.webp", "images-sdxl-148-webp/q41_d.webp"],
  // Question 42
  ["images-sdxl-148-webp/q42_a.webp", "images-sdxl-148-webp/q42_b.webp", "images-sdxl-148-webp/q42_c.webp", "images-sdxl-148-webp/q42_d.webp"],
  // Question 43
  ["images-sdxl-148-webp/q43_a.webp", "images-sdxl-148-webp/q43_b.webp", "images-sdxl-148-webp/q43_c.webp", "images-sdxl-148-webp/q43_d.webp"],
  // Question 44
  ["images-sdxl-148-webp/q44_a.webp", "images-sdxl-148-webp/q44_b.webp", "images-sdxl-148-webp/q44_c.webp", "images-sdxl-148-webp/q44_d.webp"],
  // Question 45
  ["images-sdxl-148-webp/q45_a.webp", "images-sdxl-148-webp/q45_b.webp", "images-sdxl-148-webp/q45_c.webp", "images-sdxl-148-webp/q45_d.webp"],
  // Question 46
  ["images-sdxl-148-webp/q46_a.webp", "images-sdxl-148-webp/q46_b.webp", "images-sdxl-148-webp/q46_c.webp", "images-sdxl-148-webp/q46_d.webp"],
  // Question 47
  ["images-sdxl-148-webp/q47_a.webp", "images-sdxl-148-webp/q47_b.webp", "images-sdxl-148-webp/q47_c.webp", "images-sdxl-148-webp/q47_d.webp"],
  // Question 48
  ["images-sdxl-148-webp/q48_a.webp", "images-sdxl-148-webp/q48_b.webp", "images-sdxl-148-webp/q48_c.webp", "images-sdxl-148-webp/q48_d.webp"],
  // Question 49
  ["images-sdxl-148-webp/q49_a.webp", "images-sdxl-148-webp/q49_b.webp", "images-sdxl-148-webp/q49_c.webp", "images-sdxl-148-webp/q49_d.webp"],
  // Question 50
  ["images-sdxl-148-webp/q50_a.webp", "images-sdxl-148-webp/q50_b.webp", "images-sdxl-148-webp/q50_c.webp", "images-sdxl-148-webp/q50_d.webp"],
];
