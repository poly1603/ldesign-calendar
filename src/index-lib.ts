/**
 * @ldesign/calendar - UMD 构建入口
 * 用于浏览器环境的直接引入
 */

// 导出所有内容
export * from './index';

// 导入默认导出并重新导出
import CalendarDefault from './index';
export default CalendarDefault;
