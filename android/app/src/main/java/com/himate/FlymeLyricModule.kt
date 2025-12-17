package com.himate

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.*
import java.lang.reflect.Field

class FlymeLyricModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val NOTIFICATION_ID = 1 // 使用文档中建议的ID
    private val CHANNEL_ID = "flyme_lyric_channel"
    
    init {
        // 初始化NotificationManager
        val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager?
    }
    
    override fun getName(): String {
        return "FlymeLyric"
    }
    
    /**
     * 反射获取字段值，严格按照文档实现
     */
    private fun getFieldStepwise(desClass: Class<*>, desObj: Any?, fieldName: String): Any? {
        try {
            val field: Field = desClass.getDeclaredField(fieldName)
            field.isAccessible = true
            return field.get(desObj)
        } catch (e: Exception) {
            throw NoSuchFieldException(fieldName)
        }
    }
    
    /**
     * 创建通知渠道（Android O及以上需要）
     */
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Flyme Lyric Channel"
            val descriptionText = "Channel for Flyme status bar lyric"
            val importance = NotificationManager.IMPORTANCE_DEFAULT
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
            }
            val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager?
            notificationManager?.createNotificationChannel(channel)
        }
    }
    
    /**
     * 设置状态栏歌词，参考之前能显示的版本修复
     */
    @ReactMethod
    fun setLyric(text: String, promise: Promise) {
        try {
            if (text.isEmpty()) {
                promise.resolve(false)
                return
            }
            
            // Android O及以上需要创建通知渠道
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                createNotificationChannel()
            }
            
            var mflag_show_ticker = 0
            var mflag_update_ticker = 0
            
            // 通过反射获取定义在 Notification 类的静态常量 flag 值
            try {
                val objClass = Class.forName("android.app.Notification")
                mflag_show_ticker = getFieldStepwise(objClass, objClass, "FLAG_ALWAYS_SHOW_TICKER") as Int
                mflag_update_ticker = getFieldStepwise(objClass, objClass, "FLAG_ONLY_UPDATE_TICKER") as Int
            } catch (e: Exception) {
                e.printStackTrace()
                promise.resolve(false)
                return
            }
            
            // 构建通知，参考之前能显示的版本，添加必要的属性
            val builder = NotificationCompat.Builder(reactContext, CHANNEL_ID)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setSmallIcon(android.R.drawable.ic_media_play)
                //.setContentTitle("音乐播放") // 之前能显示的版本包含此属性
                .setContentText(text) // 之前能显示的版本包含此属性
                .setTicker(text) // 歌词内容，这是状态栏歌词的核心
                .setOngoing(true) // 之前能显示的版本包含此属性
                .setAutoCancel(false) // 之前能显示的版本包含此属性
            
            val mNotification = builder.build()
            mNotification.flags = mNotification.flags or Notification.FLAG_NO_CLEAR // 必须添加，使该条通知常驻
            
            if (mflag_show_ticker > 0) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    mNotification.extras.putBoolean("ticker_icon_switch", true) // 之前能显示的版本设置为true
                    mNotification.extras.putInt("ticker_icon", android.R.drawable.ic_media_play)
                }
                mNotification.flags = mNotification.flags or mflag_show_ticker // show lyric
                mNotification.flags = mNotification.flags or mflag_update_ticker // only update lyric
            } else {
                mNotification.flags = mNotification.flags and mflag_show_ticker.inv()
                mNotification.flags = mNotification.flags and mflag_update_ticker.inv()
            }
            
            // 发送通知
            val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager?
            if (notificationManager != null) {
                notificationManager.notify(NOTIFICATION_ID, mNotification)
            }
            
            promise.resolve(true)
        } catch (e: Exception) {
            e.printStackTrace()
            promise.reject("ERROR_SET_LYRIC", e)
        }
    }
    
    /**
     * 更新播放状态图标
     */
    @ReactMethod
    fun updatePlayState(isPlaying: Boolean, promise: Promise) {
        try {
            // Android O及以上需要创建通知渠道
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                createNotificationChannel()
            }
            
            var mflag_show_ticker = 0
            var mflag_update_ticker = 0
            
            // 通过反射获取定义在 Notification 类的静态常量 flag 值
            try {
                val objClass = Class.forName("android.app.Notification")
                mflag_show_ticker = getFieldStepwise(objClass, objClass, "FLAG_ALWAYS_SHOW_TICKER") as Int
                mflag_update_ticker = getFieldStepwise(objClass, objClass, "FLAG_ONLY_UPDATE_TICKER") as Int
            } catch (e: Exception) {
                e.printStackTrace()
                promise.resolve(false)
                return
            }
            
            // 构建通知
            val iconRes = if (isPlaying) android.R.drawable.ic_media_play else android.R.drawable.ic_media_pause
            val builder = NotificationCompat.Builder(reactContext, CHANNEL_ID)
                .setPriority(Notification.PRIORITY_MAX)
                .setSmallIcon(iconRes)
            
            val mNotification = builder.build()
            mNotification.flags = mNotification.flags or Notification.FLAG_NO_CLEAR // 必须添加，使该条通知常驻
            
            if (mflag_show_ticker > 0) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    mNotification.extras.putBoolean("ticker_icon_switch", false)
                    mNotification.extras.putInt("ticker_icon", iconRes)
                }
                mNotification.flags = mNotification.flags or mflag_show_ticker // show lyric
                mNotification.flags = mNotification.flags or mflag_update_ticker // only update lyric
            }
            
            // 发送通知
            val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager?
            if (notificationManager != null) {
                notificationManager.notify(NOTIFICATION_ID, mNotification)
            }
            
            promise.resolve(true)
        } catch (e: Exception) {
            e.printStackTrace()
            promise.reject("ERROR_UPDATE_PLAY_STATE", e)
        }
    }
    
    /**
     * 清除状态栏歌词
     */
    @ReactMethod
    fun clearLyric(promise: Promise) {
        try {
            val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager?
            notificationManager?.cancel(NOTIFICATION_ID)
            promise.resolve(true)
        } catch (e: Exception) {
            e.printStackTrace()
            promise.reject("ERROR_CLEAR_LYRIC", e)
        }
    }
    
    /**
     * 检查是否支持Flyme状态栏歌词
     */
    @ReactMethod
    fun isSupported(promise: Promise) {
        try {
            var mflag_show_ticker = 0
            var mflag_update_ticker = 0
            
            // 通过反射获取定义在 Notification 类的静态常量 flag 值
            try {
                val objClass = Class.forName("android.app.Notification")
                mflag_show_ticker = getFieldStepwise(objClass, objClass, "FLAG_ALWAYS_SHOW_TICKER") as Int
                mflag_update_ticker = getFieldStepwise(objClass, objClass, "FLAG_ONLY_UPDATE_TICKER") as Int
                promise.resolve(true)
            } catch (e: Exception) {
                // 非Flyme系统或不支持该功能
                promise.resolve(false)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            promise.reject("ERROR_CHECK_SUPPORT", e)
        }
    }
}
