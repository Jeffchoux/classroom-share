# ClassroomShare (familial)

Partage d’écran ultra simple (WebRTC) à ouvrir via un lien Vercel. Sans Firebase.
Signalisation via endpoints REST + Vercel KV (Upstash).

## Démarrage rapide

```bash
npm install
npm run dev
```

Ouvre http://localhost:3000

## Déploiement

1. GitHub: init + push (voir plus bas).
2. Vercel: Import Project → ajouter variables env:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. Deploy. Partage le lien.

## Variables d’environnement

Créer `.env.local` si tu veux tester KV en local (optionnel, dev):
```
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

## GitHub
```bash
git init && git add . && git commit -m "init"
git branch -M main
git remote add origin https://github.com/<ton-user>/<classroom-share>.git
git push -u origin main
```

## Remarques
- Chrome/Edge conseillés pour capturer l’audio système.
- Le mesh WebRTC est OK pour ~6–10 spectateurs sur un Wi‑Fi classique.
