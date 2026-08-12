INSERT INTO public.page_sections (page_slug, section_key, headline, subheading, section_template, is_visible, sort_order)
SELECT 'media', 'cards', 'Explore More', 'Media', 'card_grid', true, 8
WHERE NOT EXISTS (SELECT 1 FROM public.page_sections WHERE page_slug='media' AND section_key='cards');

WITH sec AS (SELECT id FROM public.page_sections WHERE page_slug='media' AND section_key='cards')
INSERT INTO public.page_section_items (section_id, item_key, title, body, cta_label, cta_href, link_type, link_target, is_visible, sort_order)
SELECT sec.id, v.item_key, v.title, v.body, v.cta_label, v.cta_href, v.link_type, v.link_target, true, v.sort_order
FROM sec, (VALUES
  ('albums','Church Albums','Moments of worship, family and fellowship.','Browse albums','/events/albums','internal','self',0),
  ('podcast','Praise Talks Podcast','Conversations that stir faith and fuel purpose.','Listen now','/media/podcast','internal','self',1),
  ('radio','Praise Palace Radio','Faith-filled broadcasts, streaming 24/7.','Tune in','https://praisepalaceradio.com/','external','blank',2)
) AS v(item_key,title,body,cta_label,cta_href,link_type,link_target,sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.page_section_items i WHERE i.section_id = sec.id AND i.item_key = v.item_key
);