/**
 * @ldesign/calendar-core - 闂備焦瀵х壕鎼佺叓閸パ呫偣闂備礁娼￠幃鍫曞幢濡や胶褰?
 * 缂傚倷鑳堕崰宥囩博鐎靛摜涓嶉柨娑樺閸婄偤姊洪幐搴ｏ紭闂婎偄娲ょ粊褰掓⒑?
 */

/**
 * 闂婎偄娲ょ粊褰掓⒑閸喖璧嬬紓?
 */
export interface Shortcut {
  /** 闂備浇娉曢妴瀣濞嗘劒绻?'a', 'Enter', 'ArrowLeft'闂?*/
  key: string
  /** 闂佸搫瀚崕濠囨⒒閸モ晜鍟哄☉鎾虫晢rl/Command闂?*/
  ctrl?: boolean
  /** 闂佸搫瀚崕濠囨⒒閸モ晜鍟哄☉鎾舵挙ift闂?*/
  shift?: boolean
  /** 闂佸搫瀚崕濠囨⒒閸モ晜鍟哄☉鎾冲煇t闂?*/
  alt?: boolean
  /** 闂佸搫瀚崕濠囨⒒閸モ晜鍟哄☉鎾舵暋ta闂備浇娉曠粈鍑猘c Command闂備浇娉曠粈?*/
  meta?: boolean
  /** 婵犮垼娉涚€氼噣骞冩繝鍥х闁兼亽鍎插▓?*/
  handler: (event: KeyboardEvent) => void
  /** 闂佺顕х换妤呭醇椤忓牊鏅柛顐犲灪閺嗗繐霉濠婂啴顎楅幖瀛樼矒瀹曟繈寮搁崘顭戞禆闁挎繂绻掔粈?*/
  description?: string
  /** 闂佸搫瀚崕濠囨煕濮橆厽娈?*/
  enabled?: boolean
}

/**
 * 闂婎偄娲ょ粊褰掓⒑鐠恒劎鐓侀梺鍛婅壘閻楁捇寮鐘亾濞戞瑯娈樻繛鎴炴尭瀵爼鎮х粙娆惧殨?
 * 婵炴挻鑹鹃? 'Ctrl+S', 'Shift+Alt+N', 'Meta+Z'
 */
type ShortcutKey = string

/**
 * 闂備焦瀵х壕鎼佺叓閸パ呫偣闂備礁娼￠幃鍫曞幢濡や胶褰?
 */
export class ShortcutManager {
  private shortcuts = new Map<ShortcutKey, Shortcut>()
  private enabled = true
  private boundHandler: ((event: Event) => void) | null = null

  /**
   * 濠电偛顦弬鈧棅顐㈡搐缁佸綊姊?
   * @param shortcut - 闂婎偄娲ょ粊褰掓⒑閸喖璧嬬紓?
   * @returns 闂佸憡鐟﹂悧妤冪矓瀹勬壋鏋栭柛鐐扮矙瀹曟瑩鎳為妷锔筋啀
   */
  register(shortcut: Shortcut): () => void {
    const key = this.buildKey(shortcut)
    this.shortcuts.set(key, { ...shortcut, enabled: shortcut.enabled ?? true })

    // 闁哄鏅滈弻銊ッ洪弽顓炵煑闁哄秲鍔庡暩濠电偛顦弬鈧梺鍛婂灱婵倝寮?
    return () => this.unregister(key)
  }

  /**
   * 闂佸綊娼х紞濠囧闯閸濆嫧鏋栭柛鐐测偓鐔虹杸鐎规挸閰ｉ弻?
   * @param shortcuts - 闂婎偄娲ょ粊褰掓⒑閹稿孩顔嶇紓?
   */
  registerAll(shortcuts: Shortcut[]): () => void {
    const unregisters = shortcuts.map(s => this.register(s))
    return () => unregisters.forEach(fn => fn())
  }

  /**
   * 闂佸憡鐟﹂悧妤冪矓瀹勬壋鏋栭柛鐐测偓鐔虹杸鐎规挸閰ｉ弻?
   * @param key - 闂婎偄娲ょ粊褰掓⒑閸喚浠愰棅顐㈡搐缁佸綊姊虹捄銊х厑闂佸憡鑹鹃悧鍡涙偤瑜忕划顓犳啺?
   */
  unregister(key: string | Shortcut): void {
    const keyStr = typeof key === 'string' ? key : this.buildKey(key)
    this.shortcuts.delete(keyStr)
  }

  /**
   * 濠电偞鎸搁幊鎰版煙閻㈢瀚夊璺猴攻瑜般儵鏌熼崷顓炲幋闁?
   */
  clear(): void {
    this.shortcuts.clear()
  }

  /**
   * 闂佸憡鑹捐闂備焦瀵х壕鎼佹煟閳哄倸鐏ラ柟?
   * @param target - 闂佺儵鏅滈崹鐢稿箚婢舵劖鍎庨柣鏍电秮瀹曟宕橀鍡╂Ш闂佹寧绋戦惌鍌滃垝椤栨粍濯奸悹鎰壈ocument
   */
  attach(target: HTMLElement | Document = document): void {
    if (this.boundHandler) {
      this.detach()
    }

    this.boundHandler = this.handleKeyDown.bind(this)
    target.addEventListener('keydown', this.boundHandler)
  }

  /**
   * 闂佺顑嗙划宥夋⒑閹稿海锛橀梺鐑╂櫆閸ㄧ敻骞?
   * @param target - 闂佺儵鏅滈崹鐢稿箚婢舵劖鍎庨柣鏍电秮瀹曟宕橀鍡╂Ш闂佹寧绋戦惌鍌滃垝椤栨粍濯奸悹鎰壈ocument
   */
  detach(target: HTMLElement | Document = document): void {
    if (this.boundHandler) {
      target.removeEventListener('keydown', this.boundHandler)
      this.boundHandler = null
    }
  }

  /**
   * 婵犮垼娉涚€氼噣骞冩繝鍥ㄧ叆婵炴彃绻橀獮鎰緞婢跺瞼鎲繛瀛樼矊椤戝嫬鈻?
   */
  private handleKeyDown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!this.enabled) {
      return
    }

    // 濠碘槅鍋婂璇参ｉ幖浣歌Е婵犫偓椤忓懏缍囬柟鎯у暱瀵娊鏌涜箛鎾虫殶缂佲偓鐏炲墽鈻?
    if (this.isInputElement(keyboardEvent.target)) {
      return
    }

    const key = this.buildKeyFromEvent(keyboardEvent)
    const shortcut = this.shortcuts.get(key)

    if (shortcut && shortcut.enabled !== false) {
      event.preventDefault()
      event.stopPropagation()
      shortcut.handler(keyboardEvent)
    }
  }

  /**
   * 濠碘槅鍋婂璇参ｉ幖浣歌Е婵犫偓椤忓懏缍囬柟鎯у暱瀵娊鏌涜箛鎾虫殶缂佲偓鐏炲墽鈻?
   */
  private isInputElement(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) {
      return false
    }

    const tagName = target.tagName.toLowerCase()
    return (
      tagName === 'input'
      || tagName === 'textarea'
      || tagName === 'select'
      || target.isContentEditable
    )
  }

  /**
   * 婵炲濮寸花鑲╄姳閵婏妇顩烽柤鍝ユ暩閳ь剦鍨伴娆徝洪鍛闁诲孩绋掗〃鍫濃槈?
   */
  private buildKeyFromEvent(event: KeyboardEvent): string {
    const parts: string[] = []

    if (event.ctrlKey) {
      parts.push('Ctrl')
    }
    if (event.shiftKey) {
      parts.push('Shift')
    }
    if (event.altKey) {
      parts.push('Alt')
    }
    if (event.metaKey) {
      parts.push('Meta')
    }

    parts.push(event.key)

    return parts.join('+')
  }

  /**
   * 婵炲濮存鎼佸箵閳哄懎绠查柣鎴ｅГ閺嗘盯姊洪弶璺ㄐら柣銈呮瀵悂宕熼銈囧闂備浇娉曢幗鐔虹磼濡ゅ嫷娲?
   */
  private buildKey(shortcut: Shortcut): string {
    const parts: string[] = []

    if (shortcut.ctrl) {
      parts.push('Ctrl')
    }
    if (shortcut.shift) {
      parts.push('Shift')
    }
    if (shortcut.alt) {
      parts.push('Alt')
    }
    if (shortcut.meta) {
      parts.push('Meta')
    }

    parts.push(shortcut.key)

    return parts.join('+')
  }

  /**
   * 闂佸憡纰嶉弳蹇涚叓閸パ呫偣闂?
   * @param key - 闂婎偄娲ょ粊褰掓⒑閸喚浠愰棅顐㈡搐缁佸綊姊虹捄銊х厑闂佸憡鑹鹃悧鍡涙偤瑜忕划顓犳啺?
   */
  enable(key?: string | Shortcut): void {
    if (!key) {
      this.enabled = true
      return
    }

    const keyStr = typeof key === 'string' ? key : this.buildKey(key)
    const shortcut = this.shortcuts.get(keyStr)
    if (shortcut) {
      shortcut.enabled = true
    }
  }

  /**
   * 缂備礁鍊烽懗鍫曞极閵堝牏鐤€鐎规挸閰ｉ弻?
   * @param key - 闂婎偄娲ょ粊褰掓⒑閸喚浠愰棅顐㈡搐缁佸綊姊虹捄銊х厑闂佸憡鑹鹃悧鍡涙偤瑜忕划顓犳啺?
   */
  disable(key?: string | Shortcut): void {
    if (!key) {
      this.enabled = false
      return
    }

    const keyStr = typeof key === 'string' ? key : this.buildKey(key)
    const shortcut = this.shortcuts.get(keyStr)
    if (shortcut) {
      shortcut.enabled = false
    }
  }

  /**
   * 闂佸吋鍎抽崲鑼躲亹閸ヮ剙绠ラ梺鍝勭墕椤︻垶骞撻埡鍛闁绘垼濮ら弳?
   */
  getAll(): Shortcut[] {
    return Array.from(this.shortcuts.values())
  }

  /**
   * 闂佸吋鍎抽崲鑼躲亹閸ヮ剙绠ラ梺鍝勭墕椤︻垶骞撻埡鍛闁绘垼濮ら弳娑㈡煙鐠囪尙绠洪柛顐邯閺佸秹宕奸姀鈩冩婵炲瓨绮屾鍛婃償濠婂牆绀夐柡瀣暙椤╁ジ鏁愯箛鏇狀槴
   */
  getHelp(): Array<{ keys: string; description: string }> {
    return Array.from(this.shortcuts.entries())
      .filter(([_, shortcut]) => shortcut.description)
      .map(([keys, shortcut]) => ({
        keys,
        description: shortcut.description!,
      }))
  }

  /**
   * 闂備礁鐏濊濞达絾妞介幃鍫曞幢濡や胶褰?
   */
  destroy(): void {
    this.detach()
    this.clear()
  }
}

/**
 * 闂佸憡甯楃粙鎴犵磽閹惧湱鐤€鐎规挸閰ｉ弻銊╂煟閻愬弶顥滄繛鍛浮閹啴宕熼鍡忔晙闂佸湱鎳撻崲鏌ュ吹闁秴鏋?
 */
export function createShortcutManager(): ShortcutManager {
  return new ShortcutManager()
}

/**
 * Common keyboard shortcuts
 */
export const CommonShortcuts = {
  /** Undo */
  undo: { key: 'z', ctrl: true, description: 'Undo' },
  /** Redo (Windows/Linux) */
  redo: { key: 'y', ctrl: true, description: 'Redo' },
  /** Redo (Mac) */
  redoMac: { key: 'z', ctrl: true, shift: true, description: 'Redo' },
  /** Save */
  save: { key: 's', ctrl: true, description: 'Save' },
  /** Copy */
  copy: { key: 'c', ctrl: true, description: 'Copy' },
  /** Cut */
  cut: { key: 'x', ctrl: true, description: 'Cut' },
  /** Paste */
  paste: { key: 'v', ctrl: true, description: 'Paste' },
  /** Select All */
  selectAll: { key: 'a', ctrl: true, description: 'Select All' },
  /** Delete */
  delete: { key: 'Delete', description: 'Delete' },
  /** Cancel */
  escape: { key: 'Escape', description: 'Cancel' },
  /** Enter */
  enter: { key: 'Enter', description: 'Enter' },
} as const


