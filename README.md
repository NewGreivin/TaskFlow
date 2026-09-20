# TaskFlow — Fase 7

Preparación para QA y compilación Android.

## Ejecutar
```bash
npm install
npx expo-doctor
npx expo start
```

## APK
```bash
npx eas login
npx eas build:configure
npm run build:apk
```

El perfil `preview` genera una APK instalable.

## AAB / Play Store
```bash
npm run build:aab
```

Reemplaza `REPLACE_WITH_EAS_PROJECT_ID` en `app.json` por el `projectId` que te asigne EAS.

## QA manual
1. Crear, editar, completar y eliminar tareas.
2. Crear/editar/eliminar categorías.
3. Probar subtareas.
4. Cambiar Light/Dark/System.
5. Cerrar y abrir la app para comprobar persistencia.
6. Programar una notificación y tocarla.
7. Probar en Android físico.
8. Ejecutar la pantalla interna `/diagnostics`.

La APK requiere autenticación con una cuenta Expo/EAS y se compila en los servicios de EAS.
