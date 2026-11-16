# Popular Use Cases review evidence

The collection is named Popular Use Cases and lives at `/topics/popular-use-cases`.
The retired `/topics/top-10` route returns 404 without a redirect, including
localized variants. Its ten members remain in the collection, with Voice Shopping
first and Customer Support second. On the homepage those demos are recommendations
three and four and carry coral FEATURED ribbons at font weight 600.

The screenshots show the actual local application with the final implementation.
The collection artwork preserves the town illustration while replacing its title.
The long collection label remains noninteractive in card and list views.

## Screenshots

### Homepage, 1280px light appearance

![Homepage recommendations and Featured ribbons](homepage.png)

### Popular Use Cases, 1280px light appearance

![Popular Use Cases with Shopping first](collection.png)

### Topics directory, 1280px light appearance

![Renamed Topic and updated cover](topics.png)

### Homepage, 320px dark appearance

![Phone card labels and ribbons](phone-dark.png)

## Validation

- `npm run lint` passed with the existing `agora-logo.tsx` image warning.
- `npm run build` passed, including regeneration of all 122 guide artifacts.
- 49 focused tests passed across topics, contributions, locales, recipe discovery,
  SEO, recipe metadata and system appearance.
- Local HTTP checks cover the new route, retired route, canonical metadata and
  sitemap. Browser checks cover collection search, recipe return navigation and
  contribution association.
- Screenshots use browser viewport simulation, not physical-device testing.

Historical UTM campaign names are retained. The obsolete route is intentionally
not redirected, so old shared links stop resolving after this change is deployed.
