/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AndroidProjectFile {
  path: string;
  language: 'kotlin' | 'toml' | 'xml' | 'groovy' | 'markdown' | 'json';
  description: string;
  sourceCode: string;
}

export const ANDROID_PROJECT_FILES: AndroidProjectFile[] = [
  {
    path: 'gradle/libs.versions.toml',
    language: 'toml',
    description: 'Catálogo de versões compartilhadas Gradle (Version Catalog) atualizado para SDK 35',
    sourceCode: `[versions]
agp = "8.7.2"
kotlin = "2.0.21"
coreKtx = "1.15.0"
junit = "4.13.2"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.9.3"
composeBom = "2024.11.00"
navigationCompose = "2.8.4"
hilt = "2.52"
hiltNavigationCompose = "1.2.0"
supabase = "2.6.1"
ktor = "2.3.12"
coil = "2.7.0"
billing = "7.1.1"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-compose-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-compose-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }

# Dependency Injection - Hilt
hilt-android = { group = "com.google.dagger", name = "hilt-android", version.ref = "hilt" }
hilt-compiler = { group = "com.google.dagger", name = "hilt-compiler", version.ref = "hilt" }
androidx-hilt-navigation-compose = { group = "androidx.hilt", name = "hilt-navigation-compose", version.ref = "hiltNavigationCompose" }

# Supabase SDK Modules
supabase-postgrest = { group = "io.github.jan-tennert.supabase", name = "postgrest-kt", version.ref = "supabase" }
supabase-gotrue = { group = "io.github.jan-tennert.supabase", name = "gotrue-kt", version.ref = "supabase" }
supabase-realtime = { group = "io.github.jan-tennert.supabase", name = "realtime-kt", version.ref = "supabase" }

# Image Loading
coil-compose = { group = "io.coil-kt", name = "coil-compose", version.ref = "coil" }

# Google Play Space Billing
play-billing = { group = "com.android.billingclient", name = "billing", version.ref = "billing" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
`
  },
  {
    path: 'build.gradle.kts',
    language: 'kotlin',
    description: 'Configuração do arquivo root build.gradle do Gradle 8.9',
    sourceCode: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.hilt) apply false
}
`
  },
  {
    path: 'app/build.gradle.kts',
    language: 'kotlin',
    description: 'Build script do módulo principal da aplicação (/app)',
    sourceCode: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.hilt)
    kotlin("plugin.serialization") version "2.0.21"
}

android {
    namespace = "br.com.despertar.biblia"
    compileSdk = 35

    defaultConfig {
        applicationId = "br.com.despertar.biblia"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug") // Configurar assinatura do produtor
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }
    kotlinOptions {
        jvmTarget = "21"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.navigation.compose)

    // Hilt Dependency Injection
    implementation(libs.hilt.android)
    kapt(libs.hilt.compiler)
    implementation(libs.androidx.hilt.navigation-compose)

    // Supabase modules
    implementation(libs.supabase.postgrest)
    implementation(libs.supabase.gotrue)
    implementation(libs.supabase.realtime)
    implementation("io.ktor:ktor-client-okhttp:2.3.12")

    // Image loading
    implementation(libs.coil.compose)

    // Play Billing
    implementation(libs.play.billing)
}
`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Manifesto Android com as permissões de Internet e Cobrança do Google Play integradas',
    sourceCode: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="br.com.despertar.biblia">

    <!-- Requisitos Google Play e Integrações de Rede -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="com.android.vending.BILLING" />

    <application
        android:name=".DespertarApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.DespertarApp.Splash">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.DespertarApp.Main">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
  },
  {
    path: 'app/.../di/SupabaseModule.kt',
    language: 'kotlin',
    description: 'Injeção de dependência com Hilt do cliente do Supabase oficial para as tabelas de Mesas',
    sourceCode: `package br.com.despertar.biblia.di

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import io.github.jan.tennert.supabase.SupabaseClient
import io.github.jan.tennert.supabase.createSupabaseClient
import io.github.jan.tennert.supabase.postgrest.Postgrest
import io.github.jan.tennert.supabase.gotrue.GoTrue
import io.github.jan.tennert.supabase.realtime.Realtime
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object SupabaseModule {

    @Provides
    @Singleton
    fun provideSupabaseClient(): SupabaseClient {
        return createSupabaseClient(
            supabaseUrl = "https://SEU_PROJETO_SUPABASE.supabase.co",
            supabaseKey = "SUA_ANON_PUBLIC_KEY"
        ) {
            install(Postgrest)
            install(GoTrue)
            install(Realtime)
        }
    }
}
`
  },
  {
    path: 'app/.../repository/MesaRepository.kt',
    language: 'kotlin',
    description: 'Contrato e implementação do repositório de Mesas conectando-se ao Supabase',
    sourceCode: `package br.com.despertar.biblia.repository

import br.com.despertar.biblia.domain.MesaModel
import io.github.jan.tennert.supabase.SupabaseClient
import io.github.jan.tennert.supabase.postgrest.postgrest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject

interface MesaRepository {
    async fun getMesas(): List<MesaModel>
    async fun createMesa(mesa: MesaModel): Boolean
    async fun joinMesa(mesaId: String, userId: String): Boolean
}

class SupabaseMesaRepository @Inject constructor(
    private val supabase: SupabaseClient
) : MesaRepository {

    override suspend fun getMesas(): List<MesaModel> = withContext(Dispatchers.IO) {
        try {
            supabase.postgrest["mesas"]
                .select()
                .decodeList<MesaModel>()
        } catch (e: Exception) {
            emptyList()
        }
    }

    override suspend fun createMesa(mesa: MesaModel): Boolean = withContext(Dispatchers.IO) {
        try {
            supabase.postgrest["mesas"].insert(mesa)
            true
        } catch (e: Exception) {
            false
        }
    }

    override suspend fun joinMesa(mesaId: String, userId: String): Boolean = withContext(Dispatchers.IO) {
        try {
            // Lógica RPC ou Update para acrescentar o id do usuário participante na lista da mesa
            supabase.postgrest["mesas"].update(
                mapOf("vagas_preenchidas" to "vagas_preenchidas + 1")
            ) {
                filter {
                    MesaModel::id eq mesaId
                }
            }
            true
        } catch (e: Exception) {
            false
        }
    }
}
`
  },
  {
    path: 'app/.../ui/BreathingCanvas.kt',
    language: 'kotlin',
    description: 'Componente Jetpack Compose customizado para simular o circulo de respiração contemplativa Calm',
    sourceCode: `package br.com.despertar.biblia.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import kotlin.math.sin

@Composable
fun BreathingCanvas(
    modifier: Modifier = Modifier,
    breatheColor: Color = Color(0xFFC08261) // Cor de bronze/terrosa suave
) {
    val infiniteTransition = rememberInfiniteTransition(label = "respiracao")
    
    // Transição de escala suave imitando ritmo de respiração prânica: 4s inspirando, 4s expirando
    val animatedRadiusRatio by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 4000, easing = EaseInOutSine),
            repeatMode = RepeatMode.Reverse
        ),
        label = "escala"
    )

    Canvas(
        modifier = modifier
            .size(240.dp)
            .graphicsLayer {
                scaleX = animatedRadiusRatio
                scaleY = animatedRadiusRatio
            }
    ) {
        // Círculo principal com transparência espiritual
        drawCircle(
            color = breatheColor.copy(alpha = 0.15f),
            radius = size.minDimension / 2f
        )
        // Núcleo do círculo de centralização
        drawCircle(
            color = breatheColor.copy(alpha = 0.40f),
            radius = size.minDimension / 3.5f
        )
        // Ponto de luz interno concentrando energia
        drawCircle(
            color = breatheColor,
            radius = size.minDimension / 10f
        )
    }
}
`
  },
  {
    path: 'app/.../theme/DespertarTheme.kt',
    language: 'kotlin',
    description: 'Paleta espiritual contendo os tons Beges, Cobre Suaves e Pretos Terrosos nos padrões Material 3',
    sourceCode: `package br.com.despertar.biblia.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DespertarLightColors = lightColorScheme(
    primary = Color(0xFFC08261),       // Terracota / Cobre Suave
    secondary = Color(0xFF8C6239),     // Argila quentinha
    background = Color(0xFFF9F6F0),    // Creme suave, respirável (Off-White)
    surface = Color(0xFFFFFFFF),       // Puro Alva
    onPrimary = Color(0xFFFFFFFF),
    onBackground = Color(0xFF2C2520),  // Preto Terroso acalentador
    onSurface = Color(0xFF2C2520)
)

private val DespertarDarkColors = darkColorScheme(
    primary = Color(0xFFC08261),
    secondary = Color(0xFFD3A380),
    background = Color(0xFF1D1B19),    // Escuro aconchegante
    surface = Color(0xFF272422),       // Card terroso noturno
    onPrimary = Color(0xFF1D1B19),
    onBackground = Color(0xFFF9F6F0),
    onSurface = Color(0xFFE8E2D9)
)

@Composable
fun DespertarTheme(
    darkTheme: Boolean = false,
    content: @Composable () -> Unit
) {
    val colors = if (darkTheme) DespertarDarkColors else DespertarLightColors

    MaterialTheme(
        colorScheme = colors,
        typography = DespertarTypography, // Configurado com Inter e fontes Serif
        content = content
    )
}
`
  }
];
