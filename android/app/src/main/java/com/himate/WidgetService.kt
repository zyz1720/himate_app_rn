package com.himate

import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.TextView

class WidgetService : Service() {
    private lateinit var windowManager: WindowManager
    private lateinit var floatingView: View
    private var params: WindowManager.LayoutParams? = null
    private var isInitialized = false
    private var currentLyric = ""
    private var currentTranslation = ""

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onCreate() {
        super.onCreate()
        // 初始化悬浮窗口
        initFloatingView()
    }

    private fun initFloatingView() {
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager

        // 创建悬浮视图
        floatingView = LayoutInflater.from(this).inflate(R.layout.widget_layout, null)

        // 设置窗口参数
        params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                @Suppress("DEPRECATION")
                WindowManager.LayoutParams.TYPE_PHONE
            },
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        )

        params?.gravity = Gravity.TOP or Gravity.START
        params?.x = 0
        params?.y = 100

        // 设置触摸监听以实现拖拽
        val rootView = floatingView.findViewById<FrameLayout>(R.id.widget_root)

        var initialX = 0
        var initialY = 0
        var initialTouchX = 0f
        var initialTouchY = 0f
        var isDragging = false

        rootView.setOnTouchListener {
            _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = params?.x ?: 0
                    initialY = params?.y ?: 0
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    isDragging = false
                    return@setOnTouchListener true
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = event.rawX - initialTouchX
                    val dy = event.rawY - initialTouchY
                    // 如果移动距离超过5像素，认为是拖拽
                    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                        isDragging = true
                        params?.x = initialX + dx.toInt()
                        params?.y = initialY + dy.toInt()
                        windowManager.updateViewLayout(floatingView, params)
                    }
                    return@setOnTouchListener true
                }
                MotionEvent.ACTION_UP -> {
                    // 如果不是拖拽，就是点击事件
                    if (!isDragging) {
                        // 发送点击事件广播
                        val intent = Intent(ACTION_CLICK_EVENT)
                        intent.setPackage(packageName)
                        sendBroadcast(intent)
                    }
                    return@setOnTouchListener true
                }
                else -> return@setOnTouchListener false
            }
        }

        // 设置初始歌词
        updateLyric(currentLyric, currentTranslation)

        // 将悬浮视图添加到窗口管理器
        windowManager.addView(floatingView, params)
        isInitialized = true
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 处理来自React Native的命令
        intent?.let {
            when (it.action) {
                ACTION_UPDATE_LYRIC -> {
                    val lyric = it.getStringExtra(EXTRA_LYRIC) ?: ""
                    val translation = it.getStringExtra(EXTRA_TRANSLATION) ?: ""
                    updateLyric(lyric, translation)
                }
                ACTION_HIDE_WIDGET -> {
                    hideWidget()
                }
                ACTION_SHOW_WIDGET -> {
                    showWidget()
                }
                ACTION_SET_LYRIC_COLOR -> {
                    val color = it.getStringExtra(EXTRA_COLOR) ?: "#FFFFFF"
                    setLyricColor(color)
                }
                ACTION_SET_LYRIC_FONT_SIZE -> {
                    val fontSize = it.getFloatExtra(EXTRA_FONT_SIZE, 18f)
                    setLyricFontSize(fontSize)
                }
                ACTION_SET_TRANSLATION_COLOR -> {
                    val color = it.getStringExtra(EXTRA_COLOR) ?: "#80FFFFFF"
                    setTranslationColor(color)
                }
                ACTION_SET_TRANSLATION_FONT_SIZE -> {
                    val fontSize = it.getFloatExtra(EXTRA_FONT_SIZE, 14f)
                    setTranslationFontSize(fontSize)
                }
            }
        }
        return START_STICKY
    }

    private fun updateLyric(lyric: String, translation: String) {
        currentLyric = lyric
        currentTranslation = translation

        if (isInitialized) {
            val lyricText = floatingView.findViewById<TextView>(R.id.lyric_text)
            val transText = floatingView.findViewById<TextView>(R.id.trans_text)
            lyricText.text = lyric
            transText.text = translation
        }
    }

    private fun setLyricColor(color: String) {
        if (isInitialized) {
            val lyricText = floatingView.findViewById<TextView>(R.id.lyric_text)
            try {
                lyricText.setTextColor(android.graphics.Color.parseColor(color))
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun setLyricFontSize(fontSize: Float) {
        if (isInitialized) {
            val lyricText = floatingView.findViewById<TextView>(R.id.lyric_text)
            lyricText.textSize = fontSize
        }
    }

    private fun setTranslationColor(color: String) {
        if (isInitialized) {
            val transText = floatingView.findViewById<TextView>(R.id.trans_text)
            try {
                transText.setTextColor(android.graphics.Color.parseColor(color))
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun setTranslationFontSize(fontSize: Float) {
        if (isInitialized) {
            val transText = floatingView.findViewById<TextView>(R.id.trans_text)
            transText.textSize = fontSize
        }
    }

    private fun hideWidget() {
        if (isInitialized) {
            try {
                windowManager.removeView(floatingView)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            isInitialized = false
        }
    }

    private fun showWidget() {
        if (!isInitialized) {
            initFloatingView()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        hideWidget()
    }

    companion object {
        const val ACTION_UPDATE_LYRIC = "com.himate.action.UPDATE_LYRIC"
        const val ACTION_HIDE_WIDGET = "com.himate.action.HIDE_WIDGET"
        const val ACTION_SHOW_WIDGET = "com.himate.action.SHOW_WIDGET"
        const val ACTION_CLICK_EVENT = "com.himate.action.CLICK_EVENT"
        const val ACTION_SET_LYRIC_COLOR = "com.himate.action.SET_LYRIC_COLOR"
        const val ACTION_SET_LYRIC_FONT_SIZE = "com.himate.action.SET_LYRIC_FONT_SIZE"
        const val ACTION_SET_TRANSLATION_COLOR = "com.himate.action.SET_TRANSLATION_COLOR"
        const val ACTION_SET_TRANSLATION_FONT_SIZE = "com.himate.action.SET_TRANSLATION_FONT_SIZE"
        const val EXTRA_LYRIC = "lyric"
        const val EXTRA_TRANSLATION = "translation"
        const val EXTRA_COLOR = "color"
        const val EXTRA_FONT_SIZE = "font_size"
    }
}