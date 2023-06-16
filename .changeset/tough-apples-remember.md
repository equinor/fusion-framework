---
'@equinor/fusion-framework-cli': minor
---

Adding person query method to the PersonResolver in fusion-framework-cli.

The method named ``queryPerson`` searches for matches in the person table fields `name`, `email` and `phoneNumber`, with a post request to the endpoint ``search/person/query`` in the [people API](https://fusion-s-people-ci.azurewebsites.net/swagger/index.html).

