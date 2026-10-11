# Nhiệm vụ biên tập một lô

Thư mục làm việc: <WORK>
(Lệnh node luôn chạy dạng `cd "<WORK>" && node <tool>.js ...`.)

1. Đọc TOÀN BỘ `STYLE_GUIDE.md` (kể cả bảng "Bổ sung" ở cuối). Nếu có `character_bible.md`, đọc phần các nhân vật xuất hiện trong lô. Nếu hai file mâu thuẫn → theo STYLE_GUIDE.
2. Đọc file lô `B/<TÊN_LÔ>.txt` (đọc hết, theo đoạn nếu dài). Mỗi khối: `@id | người nói`, `EN:`, `VI:`; `## ...` là tiêu đề cảnh/nhóm.
3. Với lô thoại: đọc cả cảnh trước khi sửa để biết ai nói với ai. Biên tập từng dòng: đúng nghĩa EN, đúng xưng hô, văn nói tự nhiên cho thoại, văn viết chuẩn cho tài liệu/UI, thuật ngữ thống nhất. Nhân vật không rõ giới tính → không dùng đại từ có giới tính. Dòng đã ổn → giữ nguyên.
4. Ghi kết quả ra `E/<TÊN_LÔ>.part1.jsonl`, `part2.jsonl`... (≤120 dòng mỗi file, dùng tool Write). Mỗi dòng `{"id":"...","vi":"..."}`, đủ TẤT CẢ id của lô, đúng thứ tự, JSON hợp lệ (`\n` trong văn bản viết `\\n`).
5. Kiểm tra: `node validate.js <TÊN_LÔ>` → phải: missing 0, parseErr 0, không lỗi timing/tags/placeholder/empty. Sửa lỗi bằng `E/<TÊN_LÔ>.partz_fix.jsonl` (dòng sau ghi đè dòng trước), chạy lại tới khi sạch.
6. Không sửa file nào khác ngoài `E/<TÊN_LÔ>.*.jsonl`. Không xóa file.
7. Trả lời cuối (≤120 từ): số dòng đã sửa, kết quả validate, các quyết định/băn khoăn về xưng hô/thuật ngữ có thể ảnh hưởng lô khác.
