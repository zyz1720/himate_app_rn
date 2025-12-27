package com.himate.floatinglyric

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.content.Intent
import android.provider.Settings
import android.app.Activity
import android.content.Context
import android.content.BroadcastReceiver
import android.content.IntentFilter

// 导入WidgetService类，用于使用ACTION_CLICK_EVENT常量
import com.himate.floatinglyric.WidgetService

class FloatingLyricModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val broadcastReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (intent.action == WidgetService.ACTION_CLICK_EVENT) {
                // 发送点击事件到React Native
                sendEvent("onFloatingLyricClick", null)
            }
        }
    }

    init {
        // 注册广播接收器
        val filter = IntentFilter()
        filter.addAction(WidgetService.ACTION_CLICK_EVENT)
        // 添加广播接收器的导出规范
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            reactContext.registerReceiver(broadcastReceiver, filter, android.content.Context.RECEIVER_NOT_EXPORTED)
        } else {
            reactContext.registerReceiver(broadcastReceiver, filter)
        }
    }

    override fun getName(): String {
        return "FloatingLyric"
    }

    private fun sendEvent(eventName: String, params: ReadableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @Suppress("DEPRECATION")
    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        // 取消注册广播接收器
        reactApplicationContext.unregisterReceiver(broadcastReceiver)
    }

    @ReactMethod
    fun showWidget() {
        val context = reactApplicationContext
        val intent = Intent(context, WidgetService::class.java)
        intent.action = WidgetService.ACTION_SHOW_WIDGET
        context.startService(intent)
    }

    @ReactMethod
    fun hideWidget() {
        val context = reactApplicationContext
        val intent = Intent(context, WidgetService::class.java)
        intent.action = WidgetService.ACTION_HIDE_WIDGET
        context.startService(intent)
    }

    @ReactMethod
    fun updateLyric(lyric: String, translation: String) {
        val context = reactApplicationContext
        val intent = Intent(context, WidgetService::class.java)
        intent.action = WidgetService.ACTION_UPDATE_LYRIC
        intent.putExtra(WidgetService.EXTRA_LYRIC, lyric)
        intent.putExtra(WidgetService.EXTRA_TRANSLATION, translation)
        context.startService(intent)
    }

    @ReactMethod
    fun checkOverlayPermission(callback: com.facebook.react.bridge.Callback) {
        val context = reactApplicationContext
        val hasPermission = Settings.canDrawOverlays(context)
        callback.invoke(hasPermission)
    }

    @ReactMethod
    fun requestOverlayPermission() {
        val currentActivity = currentActivity
        currentActivity?.let {
            val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION)
            it.startActivityForResult(intent, OVERLAY_PERMISSION_REQUEST_CODE)
        }
    }

    @ReactMethod
    fun setLyricColor(color: String) {
        val context = reactApplicationContext
        val intent = Intent(context, WidgetService::class.java)
        intent.action = WidgetService.ACTION_SET_LYRIC_COLOR
        intent.putExtra(WidgetService.EXTRA_COLOR, color)
        context.startService(intent)
    }

    @ReactMethod
    fun setLyricFontSize(fontSize: Float) {
        val context = reactApplicationContext
        val intent = Intent(context, WidgetService::class.java)
        intent.action = WidgetService.ACTION_SET_LYRIC_FONT_SIZE
        intent.putExtra(WidgetService.EXTRA_FONT_SIZE, fontSize)
        context.startService(intent)
    }

    @ReactMethod
    fun setTranslationColor(color: String) {
        val context = reactApplicationContext
        val intent = Intent(context, WidgetService::class.java)
        intent.action = WidgetService.ACTION_SET_TRANSLATION_COLOR
        intent.putExtra(WidgetService.EXTRA_COLOR, color)
        context.startService(intent)
    }

    @ReactMethod
    fun setTranslationFontSize(fontSize: Float) {
        val context = reactApplicationContext
        val intent = Intent(context, WidgetService::class.java)
        intent.action = WidgetService.ACTION_SET_TRANSLATION_FONT_SIZE
        intent.putExtra(WidgetService.EXTRA_FONT_SIZE, fontSize)
        context.startService(intent)
    }

    @ReactMethod
    fun stopService() {
        val context = reactApplicationContext
        val intent = Intent(context, WidgetService::class.java)
        intent.action = WidgetService.ACTION_STOP_SERVICE
        context.startService(intent)
    }

    companion object {
        const val OVERLAY_PERMISSION_REQUEST_CODE = 12345
    }
}