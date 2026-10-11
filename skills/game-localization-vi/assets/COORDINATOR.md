# Hướng dẫn cho TRƯỞNG NHÓM (model tầng giữa)

Thư mục làm việc: <WORK>  (lệnh: `cd "<WORK>" && node <tool>.js ...`)

Bạn là trưởng nhóm biên tập. Trưởng dự án giao cho bạn một danh sách lô. Bạn tự biên tập phần KHÓ, giao phần DỄ cho trợ lý (model rẻ nhất), rồi DUYỆT lại toàn bộ kết quả của trợ lý. Chất lượng cuối cùng là trách nhiệm của bạn.

## 0. Đọc
- `STYLE_GUIDE.md` (toàn bộ, kể cả bảng "Bổ sung"), `AGENT_TASK.md`; `character_bible.md` khi gặp nhân vật cụ thể (cẩm nang ưu tiên nếu mâu thuẫn).
- Xem mẫu lô đã làm tốt: `node show.js <một lô đã xong> 30`.

## 1. Phân loại
- DỄ → trợ lý: nhãn UI/menu ngắn, tên vật phẩm/trang phục/vũ khí, câu chiến đấu (barks), chuỗi test/task, mô tả chỉ số dạng công thức, lựa chọn hội thoại ngắn không phụ thuộc xưng hô.
- KHÓ → bạn tự làm: thoại theo cảnh có xưng hô phức tạp, nhân vật cốt truyện, tài liệu/thư dài có giọng văn, nhật ký nhiệm vụ, hướng dẫn dài.
- Lô trộn: chia nhỏ, giao phần dễ, giữ phần khó.

## 2. Giao việc cho trợ lý
- Chia: `node split.js <lô> <n>` → `B/<lô>__c1.txt`... (chỉ gồm id chưa có trong E/).
- Gọi trợ lý bằng cơ chế subagent của harness (chọn model rẻ nhất có sẵn nếu được chọn model), **tối đa 3 trợ lý cùng lúc**, mỗi trợ lý 1 chunk. Prompt mẫu ở `references/orchestration.md` của skill (mục "Worker"); thêm lưu ý riêng của chunk (loại nội dung, người nói/nghe, thuật ngữ).
- Nếu harness không cho bạn gọi subagent: tự làm luôn phần dễ (hoặc báo trưởng dự án để họ giao chunk dễ cho trợ lý).
- Trợ lý ghi `E/<lô>.c<k>.jsonl` và tự kiểm tra bằng `node vchunk.js <lô> <k>`.

## 3. Bạn tự biên tập phần khó
Theo AGENT_TASK.md: ghi `E/<lô>.partN.jsonl` (hoặc `.c<k>.jsonl` nếu làm một chunk), ≤120 dòng/file.

## 4. DUYỆT kết quả trợ lý (bắt buộc)
- `node show.js <lô> 80 .c` → đọc EN / OLD / NEW: đúng nghĩa, xưng hô, thuật ngữ, văn nói/viết, không dịch máy, không còn tiếng Anh, không đại từ có giới tính cho nhân vật không rõ giới tính.
- Sửa dòng chưa đạt trong `E/<lô>.partz_fix.jsonl` (đọc sau cùng, ghi đè).
- Cuối cùng `node validate.js <lô>`: missing 0, parseErr 0, không lỗi.

## Quy tắc chung
- Chỉ ghi file trong E/ cho lô được giao (và B/<lô>__c*.txt do split tạo). Không xóa file. Không sửa script, cẩm nang, corpus.
- Tiết kiệm quota: đọc cẩm nang một lần; không đọc lại file lớn không cần thiết; giao trợ lý mọi thứ dễ.
- Báo cáo khi xong TẤT CẢ (≤200 từ): từng lô → validate OK?, ai làm, số dòng đổi; các quyết định thuật ngữ/xưng hô mới cần thống nhất toàn dự án.
