import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_METADATA,
  translations,
  t,
  translateMealName,
  getLocaleDirection,
  isRtl,
  formatDate,
  formatCompact,
} from './i18n';
import { APP_VERSION } from './version';

test('i18n supports English and Persian with correct metadata', () => {
  assert.deepEqual(SUPPORTED_LOCALES, ['en', 'fa']);
  assert.equal(DEFAULT_LOCALE, 'en');

  assert.equal(LOCALE_METADATA.en.dir, 'ltr');
  assert.equal(LOCALE_METADATA.en.label, 'English');

  assert.equal(LOCALE_METADATA.fa.dir, 'rtl');
  assert.equal(LOCALE_METADATA.fa.label, 'فارسی');

  assert.equal(isRtl('fa'), true);
  assert.equal(isRtl('en'), false);
  assert.equal(getLocaleDirection('fa'), 'rtl');
  assert.equal(getLocaleDirection('en'), 'ltr');
});

test('translations dictionary has full parity between en and fa', () => {
  const enKeys = Object.keys(translations.en).sort();
  const faKeys = Object.keys(translations.fa).sort();

  assert.deepEqual(faKeys, enKeys, 'All keys in en should be present in fa');

  for (const key of enKeys) {
    const enVal = translations.en[key as keyof typeof translations.en];
    const faVal = translations.fa[key as keyof typeof translations.fa];
    assert.ok(enVal.length > 0, `English string for ${key} must not be empty`);
    assert.ok(faVal.length > 0, `Persian string for ${key} must not be empty`);
  }
});

test('t() returns translated string and interpolates parameters', () => {
  assert.equal(t('en', 'today.greeting', { name: 'Sarah' }), 'Hi, Sarah.');
  assert.equal(t('fa', 'today.greeting', { name: 'سارا' }), 'سلام، سارا.');

  assert.equal(t('en', 'toast.addedTo', { meal: 'Breakfast' }), 'Added to Breakfast');
  assert.equal(t('fa', 'toast.addedTo', { meal: 'صبحانه' }), 'به صبحانه اضافه شد');
});

test('translateMealName translates standard meal names and leaves custom names intact', () => {
  assert.equal(translateMealName('Breakfast', 'fa'), 'صبحانه');
  assert.equal(translateMealName('Lunch', 'fa'), 'ناهار');
  assert.equal(translateMealName('Dinner', 'fa'), 'شام');
  assert.equal(translateMealName('Snacks', 'fa'), 'میان‌وعده');

  assert.equal(translateMealName('Breakfast', 'en'), 'Breakfast');
  assert.equal(translateMealName('Custom Meal', 'fa'), 'Custom Meal');
});

test('formatDate outputs localized date strings', () => {
  const formattedEn = formatDate('2026-10-28', 'en', { month: 'short', day: 'numeric' });
  const formattedFa = formatDate('2026-10-28', 'fa', { month: 'short', day: 'numeric' });

  assert.ok(formattedEn.includes('Oct') || formattedEn.includes('28'));
  assert.ok(formattedFa.length > 0);
});

test('app version is defined and matches semantic versioning format', () => {
  assert.ok(/^\d+\.\d+\.\d+$/.test(APP_VERSION));
  assert.equal(APP_VERSION, '0.12.0');
});

test('formatCompact shortens only numbers of a thousand or more, per locale', () => {
  assert.equal(formatCompact(950, 'en'), '950');
  assert.equal(formatCompact(11500, 'en'), '11.5K');
  assert.equal(formatCompact(2000, 'en'), '2K');
  assert.match(formatCompact(11500, 'fa'), /هزار/);
});
