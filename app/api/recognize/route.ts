import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image, imageFormat } = await request.json();

    if (!image || !imageFormat) {
      return NextResponse.json(
        { error: '缺少图片数据或格式' },
        { status: 400 }
      );
    }

    // 打印 API Key 用于调试（仅前几位）
    const apiKey = process.env.ARK_API_KEY;
    console.log('API Key 前缀:', apiKey?.substring(0, 8));
    console.log('使用端点:', 'ep-m-20251021194829-jzjh2');
    console.log('图片格式:', imageFormat);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key 未配置' },
        { status: 500 }
      );
    }

    const requestBody = {
      model: 'ep-20251020224339-h7px4',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '请详细描述这张图片的内容，包括：1. 图片的主要内容和场景 2. 图片中的物体、人物或文字 3. 图片的风格和色调。请用中文回答。'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/${imageFormat};base64,${image}`
              }
            }
          ]
        }
      ]
    };

    console.log('发送请求到火山引擎...');

    // 调用火山引擎 API
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('火山引擎 API 错误详情:', JSON.stringify(errorData, null, 2));

      // 提供更友好的错误信息
      let errorMessage = `API 错误: ${response.status}`;
      if (errorData.error?.code === 'InternalServiceError') {
        errorMessage = '服务暂时不可用，请稍后重试';
      } else if (errorData.error?.code === 'InvalidEndpoint.ClosedEndpoint') {
        errorMessage = '端点已关闭或不可用，请检查端点配置';
      } else if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }

      return NextResponse.json(
        { error: errorMessage, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 提取 AI 响应内容
    const content = data.choices?.[0]?.message?.content || '无法识别图片内容';

    return NextResponse.json({
      success: true,
      content,
      rawResponse: data
    });

  } catch (error) {
    console.error('图片识别错误:', error);
    return NextResponse.json(
      { error: '图片识别失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
