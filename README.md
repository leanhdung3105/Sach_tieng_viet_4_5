# BÉ HỌC CHỮ O CÙNG BÓNG BAY (LEARN LETTER 'O' WITH BALLOONS)

**Phiên bản:** 1.0
**Dựa trên GDD phiên bản:** 1.0 (24/05/2024)

Một trò chơi giáo dục tương tác vui nhộn dành cho trẻ mầm non (4-5 tuổi), giúp trẻ nhận biết mặt chữ "O" và âm "o" thông qua việc chạm vào các quả bóng bay chứa hình ảnh hoặc chữ cái tương ứng trong một khung cảnh tươi sáng.

## 📑 Mục lục

1.  [Giới thiệu & Gameplay](#1-giới-thiệu--gameplay)
2.  [Công nghệ sử dụng](#2-công-nghệ-sử-dụng)
3.  [Cài đặt & Phát triển](#3-cài-đặt--phát-triển)
4.  [Kiến trúc dự án](#4-kiến-trúc-dự-án)
5.  [Tính năng kỹ thuật nổi bật](#5-tính-năng-kỹ-thuật-nổi-bật)
6.  [Build & Triển khai](#6-build--triển-khai)

---

## 1. Giới thiệu & Gameplay

Game đưa người chơi vào một khung cảnh đồng cỏ tươi sáng. Nhiệm vụ của bé là quan sát các quả bóng bay từ dưới lên:
* ✅ **Chạm đúng:** Bóng chứa chữ "O" hoặc hình ảnh bắt đầu bằng âm "O" (Con cò, Cái còi, Con bò) -> Được điểm + Hiệu ứng Chữ hiện lên màn hình để bé nhận biết + Âm thanh vui nhộn.
* ❌ **Chạm sai:** Bóng không chứa gì -> Rung lắc + Âm báo sai.
* 🏆 **Kết thúc:** Hiển thị màn chúc mừng, pháo hoa giấy (Confetti) và gửi kết quả về hệ thống.

## 2. Công nghệ sử dụng

* **Core Engine:** Phaser 3 (Arcade Physics).
* **Ngôn ngữ:** TypeScript (Strict typing).
* **Build Tool:** Vite (Hot Module Replacement, Fast Build).
* **Asset Management:** Tự động load và cache tài nguyên.
* **UI/UX:** Responsive Design, hỗ trợ xoay màn hình (Orientation Handling).

## 3. Cài đặt & Phát triển

Đảm bảo bạn đã cài đặt [Node.js](https://nodejs.org/) (LTS Version).

Bước 1: Clone dự án
```bash
git clone <link-repo-của-bạn>
cd <tên-thư-mục>

Bước 2: Cài đặt thư viện

    ```bash
    npm install
    # Hoặc nếu dùng yarn: yarn install
    ```

Bước 2.  **Chạy server phát triển (Development Server):**

    ```bash
    npm run dev
    # Hoặc: yarn dev
    ```

    Sau khi chạy lệnh, terminal sẽ hiển thị địa chỉ local (ví dụ: `http://localhost:5173`). Mở địa chỉ này trên trình duyệt để xem và chơi thử game. Server này hỗ trợ tính năng "hot-reload", tự động cập nhật khi bạn thay đổi code.

## 4\. Cấu trúc dự án

(Cấu trúc này là ví dụ phổ biến cho một dự án game web sử dụng công cụ như Vite, bạn có thể điều chỉnh tùy theo thực tế dự án của mình)

```

├── public/              # Chứa các file tĩnh (sẽ được copy nguyên vẹn khi build)
│   ├── assets/
│   │   ├── images/      # Hình ảnh (Background, Nhân vật, Bóng, Vật thể...)
│   │   └── audio/       # Âm thanh (Nhạc nền, SFX, Giọng đọc)
│   └── vite.svg         # Favicon
├──src/
│   ├── audio/
│   │   └── AudioManager.ts      # Singleton quản lý toàn bộ âm thanh (Music/SFX)
│    ├── scenes/
│   │   ├── utils/
│    │   │   └── backgroundManager.ts # Quản lý đổi hình nền dynamic
│    │   ├── EndgameScene.ts      # Màn hình kết thúc: Kết quả, Nút Restart, Confetti
│    │   └── GameScene.ts         # Logic chính: Spawning bóng, tính điểm, va chạm
├── main.ts                  # Entry point, cấu hình Phaser Config (Scale.FIT)
├── rotateOrientation.ts     # Xử lý logic xoay màn hình (Mobile/Tablet)
├── style.css                # CSS cho các phần tử DOM (nút Reset, xoay màn hình)
└── vite-env.d.ts            # Định nghĩa Type cho Vite


## 5\. Tính năng kỹ thuật nổi bật

📱 Mobile Optimization (Tối ưu hóa di động)
    - Sử dụng Phaser.Scale.FIT để tự động co giãn game giữ nguyên tỉ lệ trên mọi kích thước màn hình.

    - Orientation Check: Tích hợp module rotateOrientation.ts kiểm tra hướng thiết bị, hiển thị thông báo yêu cầu xoay ngang nếu người dùng cầm dọc điện thoại.

🔊 Robust Audio System (Hệ thống âm thanh)
    - Quản lý tập trung qua AudioManager.

    - Xử lý triệt để vấn đề chồng chéo âm thanh khi Restart game (Logic stopAll trước khi reload Scene).
🔌System Integration (Tích hợp hệ thống)
    - Game có khả năng giao tiếp với nền tảng mẹ (Game Hub/Iruka) thông qua window object.

    - Tự động gửi dữ liệu complete (Score, Time, Reason) khi kết thúc game hoặc người dùng thoát sớm.


## 6\. Build & Triển khai

Để đóng gói game cho môi trường Production (tối ưu hóa code, giảm dung lượng):
    ```bash
    npm run build
    ```

Bạn có thể triển khai nội dung thư mục `dist/` lên bất kỳ dịch vụ static web hosting nào. Dưới đây là ví dụ với GitHub Pages bằng gói `gh-pages`:

1.  **Cài đặt `gh-pages` làm dev dependency (nếu chưa có):**

    ```bash
    npm install gh-pages --save-dev
    ```

2.  **Thêm script deploy vào `package.json`:**
    Trong phần `"scripts"`, thêm dòng sau:

    ```json
    "deploy": "gh-pages -d dist"
    ```

3.  **Cấu hình `base` trong `vite.config.ts` (nếu cần):**
    Nếu bạn deploy lên đường dẫn con (ví dụ: `https://username.github.io/repo-name/`), bạn cần đặt `base` là tên repository.

    ```ts
    // vite.config.ts
    export default defineConfig({
      base: '/<tên-repo-của-bạn>/',
    })
    ```

4.  **Chạy lệnh deploy:**
    Lệnh này sẽ tự động chạy `npm run build` trước, sau đó đẩy thư mục `dist` lên nhánh `gh-pages` trên GitHub của bạn.

    ```bash
    npm run deploy
    ```

## 7\. Tài nguyên (Assets)

Danh sách các tài nguyên chính được sử dụng trong game:

  * **Hình ảnh:**
      * Nền: Cảnh đồng cỏ, bầu trời.
      * Nhân vật: Em bé đang chạy bắt quả bóng.
      * Bóng bay: Nhiều màu sắc, hơi trong suốt.
      * Vật thể Đúng: Chữ O, Con Cò, Ccon bò, cái còi....
      * Vật thể Sai (Nhiễu): null.
      * VFX: pháo giấy.
  * **Âm thanh:**
      * Nhạc nền vui tươi.
      * SFX: Tiếng đúng "tinh", tiếng báo sai vui nhộn.
      * Giọng đọc: "Chữ O", "Con Cò".