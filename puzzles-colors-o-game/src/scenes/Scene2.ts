import Phaser from 'phaser';
// Nếu chưa có file AudioManager thì tạm comment dòng này lại để test logic vẽ trước
import AudioManager from '../audio/AudioManager'; 
import { setGameSceneReference, resetVoiceState } from '../rotateOrientation';

// Cấu hình vị trí (Chỉnh số ở đây để khớp hình)
const LETTER_CONFIG = {
    baseScale: 0.8,         // Độ to nhỏ của cả chữ
    parts: [
        // 1. Cái Thân (Ảnh to, tâm ở giữa -> Dịch xuống một chút)
        { key: 'o_body', offsetX: 1, offsetY: 2 }, 
        
        // 2. Cái Mũ (Ảnh bé, bị cắt sát -> Phải dịch lên trên nhiều)
        { key: 'o_hat',  offsetX: 4, offsetY: 3 } 
    ]
};

export default class Scene2 extends Phaser.Scene {
    // Biến dùng để vẽ
    private brushColor: number = 0xff0000; // Mặc định tô màu ĐỎ
    private activeRenderTexture: Phaser.GameObjects.RenderTexture | null = null; 
    private brushTexture: string = 'brush_circle';

    constructor() {
        super("Scene2");
    }

    // Hàm tiện ích lấy kích thước màn hình
    private getW() { return this.scale.width; }
    private getH() { return this.scale.height; }

    preload() {
        // --- 1. LOAD 3 FILE ẢNH CỐT LÕI (Bạn phải đảm bảo file đã có trong assets) ---
        // Lưu ý: Đổi tên file trong assets hoặc sửa tên ở đây cho khớp
        this.load.image('o_outline', 'assets/images/S2/o_outline.png');   // Viền đen
        this.load.image('o_hat', 'assets/images/S2/o_hat.png');       // Mũ (ảnh bé)
        this.load.image('o_body', 'assets/images/S2/o_body.png');

        // Không cần tải ảnh brush, tự vẽ 1 hình tròn mờ
        const size = 64;
        const canvas = this.textures.createCanvas('brush_circle', size, size);
        if (canvas) {
            const ctx = canvas.context;
            const grd = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
            grd.addColorStop(0, 'rgba(255, 0, 0, 1)'); // Màu đỏ đậm ở tâm
            grd.addColorStop(1, 'rgba(255, 0, 0, 0)'); // Mờ dần ra viền
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, size, size);
            canvas.refresh();
        }
    }

    create() {
        // Reset trạng thái nếu có
        resetVoiceState(); 
        setGameSceneReference(this);
        // 2. GỌI HÀM DỰNG CHỮ Ô (Tâm màn hình)
        this.createLetterO(this.getW() / 2, this.getH() / 2);

        // 3. XỬ LÝ SỰ KIỆN VẼ (INPUT)
        this.setupInput();
    }

    // --- LOGIC DỰNG KHUNG CHỮ Ô ---
    private createLetterO(centerX: number, centerY: number) {
        // Bước 1: Tạo các phần tô màu (Thân + Mũ)
        LETTER_CONFIG.parts.forEach(part => {
            const x = centerX + part.offsetX;
            const y = centerY + part.offsetY;
            
            // Gọi hàm tạo lớp vẽ cho từng bộ phận
            this.createPaintablePart(x, y, part.key, LETTER_CONFIG.baseScale);
        });

        // Bước 2: Đặt Viền Đen lên trên cùng 
        // (Che vết lem)
        // Viền đen 'o_no_color.png' là ảnh full size nên đặt đúng tâm
        const outline = this.add.image(centerX, centerY, 'o_outline');
        outline.setScale(LETTER_CONFIG.baseScale);
        outline.setDepth(100); // Nằm trên cao nhất
        outline.setInteractive({ pixelPerfect: true }); // Để click xuyên qua phần rỗng
    }

    // --- LOGIC TẠO LỚP VẼ (MASK + RENDER TEXTURE) ---
    private createPaintablePart(x: number, y: number, key: string, scale: number) {
        // A. Tạo KHUÔN (Mask) - Ẩn đi, chỉ dùng lấy hình dáng
        const maskImage = this.make.image({ x, y, key: key, add: false });
        maskImage.setScale(scale);
        const mask = maskImage.createBitmapMask();

        // B. Tạo TỜ GIẤY VẼ (RenderTexture)
        const rtW = maskImage.width * scale;
        const rtH = maskImage.height * scale;
        
        // Tạo RT và căn giữa vào tọa độ x,y
        const rt = this.add.renderTexture(x - rtW/2, y - rtH/2, rtW, rtH);
        rt.setOrigin(0, 0);
        rt.setMask(mask); // Áp khuôn vào -> Vẽ gì lên đây cũng chỉ hiện trong khuôn
        rt.setDepth(10);  // Nằm dưới viền đen

        // C. Tạo VÙNG CẢM ỨNG (Hit Area) để bắt click
        const hitArea = this.add.image(x, y, key).setScale(scale);
        hitArea.setAlpha(0.5); // Gần như tàng hình
        hitArea.setDepth(50);   // Nằm trên RT để bắt chuột
        
        // Quan trọng: Chỉ bắt click vào phần CÓ HÌNH (bỏ qua phần trong suốt)
        hitArea.setInteractive({ useHandCursor: true, pixelPerfect: true });

        // Sự kiện: Khi nhấn vào vùng này -> Kích hoạt RT này để vẽ
        hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.activeRenderTexture = rt;
            this.paint(pointer, rt);
            // AudioManager.play('sfx-click'); // Nếu muốn có tiếng
        });
    }

    // --- LOGIC VẼ ---
    private paint(pointer: Phaser.Input.Pointer, rt: Phaser.GameObjects.RenderTexture) {
        // Tính tọa độ chuột tương đối so với góc trái trên của RT
        const localX = pointer.x - rt.x;
        const localY = pointer.y - rt.y;

        // In hình đầu cọ lên RT
        // Số 32 là một nửa kích thước cọ (64/2) để vẽ đúng tâm chuột
        rt.draw(this.brushTexture, localX, localY, 1.0, this.brushColor);
    }

    private setupInput() {
        // Khi di chuột (mà đang nhấn giữ) -> Vẽ tiếp
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.isDown && this.activeRenderTexture) {
                this.paint(pointer, this.activeRenderTexture);
            }
        });

        // Khi nhả chuột -> Dừng vẽ (để không bị vẽ nhầm sang vùng khác)
        this.input.on('pointerup', () => {
            this.activeRenderTexture = null;
        });
    }
}