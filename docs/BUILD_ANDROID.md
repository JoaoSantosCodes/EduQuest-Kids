# 📱 Guia de Build e Publicação na Play Store - EduQuest Kids

## 🎯 Pré-requisitos

### 1. **Ferramentas Necessárias**

- ✅ Node.js 18+ instalado
- ✅ Java JDK 11 ou superior
- ✅ Android Studio instalado
- ✅ Android SDK configurado
- ✅ Conta Google Play Developer (pagamento único de $25)

### 2. **Variáveis de Ambiente**

Certifique-se de que as variáveis de ambiente estão configuradas:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

---

## 🚀 Passo 1: Preparar o Projeto

### 1.1. Instalar Dependências
```bash
npm install
```

### 1.2. Build do Projeto Web
```bash
npm run build
```

Isso criará a pasta `dist/` com os arquivos otimizados.

---

## 📦 Passo 2: Configurar Capacitor

### 2.1. Adicionar Plataforma Android
```bash
npm run cap:add:android
```

### 2.2. Sincronizar Arquivos
```bash
npm run cap:sync
```

Isso copiará os arquivos do `dist/` para o projeto Android.

---

## 🔧 Passo 3: Configurar Android

### 3.1. Abrir no Android Studio
```bash
npm run cap:open:android
```

Ou abra manualmente:
```bash
cd android
./gradlew
```

### 3.2. Configurar App ID e Nome

1. Abra `android/app/build.gradle`
2. Verifique:
   ```gradle
   applicationId "com.eduquest.kids"
   versionCode 1
   versionName "1.0.0"
   ```

### 3.3. Configurar Permissões

Abra `android/app/src/main/AndroidManifest.xml` e adicione permissões necessárias:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

---

## 🔐 Passo 4: Gerar Keystore (Assinatura)

### 4.1. Criar Keystore

```bash
keytool -genkey -v -keystore eduquest-release-key.keystore -alias eduquest -keyalg RSA -keysize 2048 -validity 10000
```

**Guarde as informações:**
- Keystore password: (senha do arquivo)
- Key password: (senha da chave)
- Alias: eduquest
- Nome: (seu nome)
- Organização: (sua organização)

### 4.2. Mover Keystore

Mova o arquivo `eduquest-release-key.keystore` para:
```
android/app/
```

### 4.3. Criar arquivo `android/key.properties`

```properties
storePassword=sua-senha-do-keystore
keyPassword=sua-senha-da-chave
keyAlias=eduquest
storeFile=app/eduquest-release-key.keystore
```

### 4.4. Configurar `android/app/build.gradle`

Adicione antes de `android {`:
```gradle
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

E configure a seção `signingConfigs`:
```gradle
android {
    ...
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 🏗️ Passo 5: Build do APK/AAB

### 5.1. Build Debug (Teste)
```bash
cd android
./gradlew assembleDebug
```

O APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`

### 5.2. Build Release (Produção)
```bash
cd android
./gradlew bundleRelease
```

O AAB estará em: `android/app/build/outputs/bundle/release/app-release.aab`

**OU** para APK assinado:
```bash
./gradlew assembleRelease
```

O APK estará em: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📲 Passo 6: Testar o App

### 6.1. Instalar APK Debug
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 6.2. Testar em Dispositivo Físico

1. Conecte seu dispositivo Android via USB
2. Habilite "Depuração USB" nas opções de desenvolvedor
3. No Android Studio, clique em "Run" ou use:
   ```bash
   npm run cap:open:android
   ```
   E clique em "Run" no Android Studio

---

## 🎨 Passo 7: Recursos Visuais

### 7.1. Ícones do App

Crie ícones nas seguintes resoluções:
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)

### 7.2. Splash Screen

Configure o splash screen em `capacitor.config.ts` (já configurado).

### 7.3. Screenshots para Play Store

Prepare screenshots:
- 1x: 320 x 480 dp (telefone)
- 2x: 480 x 800 dp (telefone)
- Tablet: 1024 x 600 dp

---

## 📤 Passo 8: Publicar na Play Store

### 8.1. Criar Conta Google Play Developer

1. Acesse: https://play.google.com/console
2. Pague a taxa única de $25
3. Complete o perfil da conta

### 8.2. Criar App na Play Console

1. Clique em "Criar app"
2. Preencha:
   - **Nome do app:** EduQuest Kids
   - **Idioma padrão:** Português (Brasil)
   - **Tipo de app:** App
   - **Gratuito ou pago:** Gratuito

### 8.3. Upload do AAB

1. Vá em "Produção" → "Criar nova versão"
2. Faça upload do arquivo `app-release.aab`
3. Adicione notas de versão

### 8.4. Preencher Informações da Loja

1. **Descrição curta:** App de estudo gamificado para crianças
2. **Descrição completa:** 
   ```
   EduQuest Kids é um aplicativo educacional gamificado 
   desenvolvido para crianças do 6º e 7º ano.
   
   Funcionalidades:
   - Quizzes interativos por matéria
   - Sistema de pontuação e níveis
   - Relatórios para pais
   - Portal para professores
   - Sistema de conquistas
   ```

3. **Screenshots:** Adicione screenshots do app
4. **Ícone:** 512x512 px
5. **Categoria:** Educação
6. **Classificação de conteúdo:** Classificação para todos
7. **Privacidade:** Preencha política de privacidade

### 8.5. Preencher Declaração de Privacidade

Crie uma política de privacidade e adicione o link.

### 8.6. Revisar e Publicar

1. Revise todas as informações
2. Clique em "Enviar para revisão"
3. Aguarde aprovação (pode levar alguns dias)

---

## 🔄 Scripts Úteis

Adicione estes scripts ao `package.json`:

```json
{
  "scripts": {
    "android:build": "npm run build && npx cap sync && npx cap open android",
    "android:sync": "npm run build && npx cap sync",
    "android:release": "cd android && ./gradlew bundleRelease"
  }
}
```

**Uso:**
```bash
# Build completo e abrir Android Studio
npm run android:build

# Sincronizar após build
npm run android:sync

# Build de release
npm run android:release
```

---

## ✅ Checklist Final

Antes de publicar, verifique:

- [ ] App testado em dispositivo físico
- [ ] Ícones e splash screen configurados
- [ ] Versão e código de versão atualizados
- [ ] AAB assinado gerado
- [ ] Screenshots preparados
- [ ] Descrição e informações preenchidas
- [ ] Política de privacidade criada
- [ ] Classificação de conteúdo configurada
- [ ] Testes realizados em diferentes dispositivos

---

## 🐛 Troubleshooting

### Erro: "SDK location not found"
Configure `ANDROID_HOME` no ambiente:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Erro: "Gradle sync failed"
1. Abra Android Studio
2. File → Invalidate Caches / Restart
3. Sync Project with Gradle Files

### Erro: "Capacitor sync failed"
```bash
npm run build
npx cap sync
```

---

## 📚 Documentação Adicional

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/)
- [Google Play Console](https://play.google.com/console)

---

**Boa sorte com a publicação!** 🚀

