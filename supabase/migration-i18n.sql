-- JIZAI Shop — englische Produktbeschreibungen
--
-- Einmalig im Supabase-SQL-Editor ausführen:
--   https://supabase.com/dashboard/project/pkqnyeonuzittsqtworu/sql/new
--
-- Die Spalte ist optional: Bleibt sie bei einem Produkt leer, zeigt die
-- englische Seite den deutschen Text. Die UPDATEs unten füllen die
-- bestehenden Produkte bereits fertig übersetzt vor.

alter table products add column if not exists description_en text;

update products set description_en =
  'The broken ensō. A small mark on the front, maximum negative space. The quietest piece of the series.'
  where slug = 'core-tee';

update products set description_en =
  'The form, held: a meditation inside the broken ensō, ink on soft stone. Energy contained — not released.'
  where slug = 'form-tee';

update products set description_en =
  'Two koi, a circle of movement — severed with precision by the JIZAI Cut. The form is broken, not destroyed. Indigo on soft stone.'
  where slug = 'break-tee';

update products set description_en =
  'Listen to the stillness.'
  where slug = 'furin-tee';
