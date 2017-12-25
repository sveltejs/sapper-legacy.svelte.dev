---
title: Deployment
---

Sapper apps run anywhere that supports Node 8 or higher.


### Deploying to Now

We can very easily deploy our apps to [Now](https://zeit.co/now):

```bash
npm install -g now
now
```

This will upload the source code to Now, whereupon it will do `npm run build` and `npm start` and give you a URL for the deployed app.

For other hosting environments, you may need to do `npm run build` yourself.