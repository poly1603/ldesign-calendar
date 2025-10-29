# 修复文件编码问题
# 将损坏的中文字符替换为正确的内容

$fileFixes = @{
  'packages/core/src/keyboard/shortcut-manager.ts' = @(
    @{ Pattern = '绮樿创'; Replacement = '粘贴' },
    @{ Pattern = '鍏ㄩ€?'; Replacement = '全选' },
    @{ Pattern = '鍒犻櫎'; Replacement = '删除' },
    @{ Pattern = '閫€鍑?鍙栨秷'; Replacement = '退出/取消' },
    @{ Pattern = '鍙栨秷'; Replacement = '取消' },
    @{ Pattern = '閿€姣?'; Replacement = '销毁' },
    @{ Pattern = '娓呯悊璧勬簮'; Replacement = '清理资源' },
    @{ Pattern = '閿洏蹇嵎閿?'; Replacement = '键盘快捷键' },
    @{ Pattern = '澶勭悊鍣?'; Replacement = '处理器' }
  )
  'packages/core/src/utils/event.ts' = @(
    @{ Pattern = '鏃犳爣棰?'; Replacement = '无标题' },
    @{ Pattern = '娴嬭瘯'; Replacement = '测试' },
    @{ Pattern = '鐨?'; Replacement = '的' }
  )
}

foreach ($file in $fileFixes.Keys) {
  $fullPath = Join-Path $PSScriptRoot $file
  if (Test-Path $fullPath) {
    Write-Host "Fixing $file..."
    $content = Get-Content $fullPath -Raw -Encoding UTF8
    
    foreach ($fix in $fileFixes[$file]) {
      $content = $content -replace [regex]::Escape($fix.Pattern), $fix.Replacement
    }
    
    # 保存为 UTF-8 without BOM
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($fullPath, $content, $utf8NoBom)
    Write-Host "  ✓ Fixed"
  }
}

Write-Host "`n所有文件编码已修复！"
Write-Host "请运行: pnpm run type-check"
