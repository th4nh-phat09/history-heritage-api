import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// 1. Tạo môi trường DOM ảo
const window = new JSDOM("").window;

// 2. Khởi tạo DOMPurify với môi trường ảo đó
// Cần truyền 'window' object từ jsdom
const DOMPurify = createDOMPurify(window);

/**
 * Lọc chuỗi HTML để loại bỏ mã độc XSS.
 * Nên sử dụng hàm này trong logic Server-side trước khi lưu vào DB.
 * @param {string} htmlString Chuỗi dữ liệu (content) cần được làm sạch.
 * @returns {string} Chuỗi dữ liệu đã được làm sạch an toàn.
 */
export const sanitizeHtml = (htmlString) => {
  // DOMPurify.sanitize() sẽ loại bỏ tất cả các thành phần nguy hiểm (như <script>, thuộc tính onerror, URL javascript:).

  const cleanHtml = DOMPurify.sanitize(htmlString, {
    // Tùy chọn: Thiết lập danh sách trắng (whitelist) cho các thẻ được phép.
    // Nếu bạn muốn cho phép người dùng dùng các thẻ định dạng đơn giản:
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href", "target"],
  });

  return cleanHtml;
};
