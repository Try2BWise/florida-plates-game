# Customization Toolkit

This folder holds reusable pieces for turning the app into a state-pack-driven license plate game.

## Files

- [plate-master.schema.json](/C:/Users/bwise/OneDrive/Gorilla%20Grin/florida-plates-game/docs/customization/plate-master.schema.json)
  - Formal authoring schema for a state plate dataset.
- [AI_SCRAPE_TEMPLATE.md](/C:/Users/bwise/OneDrive/Gorilla%20Grin/florida-plates-game/docs/customization/AI_SCRAPE_TEMPLATE.md)
  - Reusable handoff prompt for another AI job collecting a new state.

## Intended Workflow

1. Gather or scrape a state's plate data into the master schema.
2. Review and clean:
   - naming
   - categories
   - variants
   - image paths
   - search terms
3. Save the state's authoring dataset.
4. Generate a runtime plate driver from the cleaned master data.

## Design Intent

This schema is deliberately:

- strict enough to be reusable
- close to the current Florida master dataset
- flexible enough for imperfect first-pass scrape output

It is meant to support future state expansion and a future external editing tool.
