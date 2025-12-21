import Phaser from 'phaser';
import AudioManager from '../audio/AudioManager'; 
import { setGameSceneReference, resetVoiceState } from '../rotateOrientation';

// --- CẤU HÌNH CHỮ Ô (GIỮ NGUYÊN CỦA BẠN) ---
const LETTER_CONFIG = {
    baseScale: 0.7, 
    outlineKey: 'o_outline',
    parts: [
        // Scale to hơn 0.8 một chút để tràn dưới viền
        { key: 'o_body', offsetX: 1, offsetY: 2, scale: 0.7 }, 
        { key: 'o_hat',  offsetX: 4, offsetY: 5, scale: 0.71 } 
    ]
};

// --- CẤU HÌNH CÔ GIÁO (MỚI) ---
// Tôi để tạm offset là 0. Nếu hình bị lệch, bạn chỉnh offsetX, offsetY ở đây nhé.
const TEACHER_CONFIG = {
    baseScale: 0.75, // Cô giáo scale nhỏ hơn chữ Ô một chút
    outlineKey: 'co_outline',
    parts: [
        // Thứ tự xếp lớp quan trọng (Cái nào nằm dưới thì khai báo trước)
        // Tay -> Mặt -> Áo -> Sách -> Tóc
        // Scale to hơn baseScale (0.65) một chút để tràn viền
        { key: 'co_hands', offsetX: 0, offsetY: 0, scale: 0.751 },
        { key: 'co_face',  offsetX: 0, offsetY: 0, scale: 0.751 },
        { key: 'co_shirt', offsetX: 0, offsetY: 0, scale: 0.751 },
        { key: 'co_book',  offsetX: 0, offsetY: 0, scale: 0.751 },
        { key: 'co_hair',  offsetX: 0, offsetY: 0, scale: 0.751 }
    ]
};

export default class Scene2 extends Phaser.Scene {
    // Biến dùng để vẽ
    private brushColor: number = 0xff0000; // Mặc định màu ĐỎ
    private activeRenderTexture: Phaser.GameObjects.RenderTexture | null = null; 
    private brushTexture: string = 'brush_circle';

    constructor() {
        super("Scene2");
    }

    private getW() { return this.scale.width; }
    private getH() { return this.scale.height; }
    private pctX(p: number) { return this.getW() * p; }
    private pctY(p: number) { return this.getH() * p; }

    preload() {
        // --- 1. LOAD ẢNH CHỮ Ô ---
        this.load.image('o_outline', 'assets/images/S2/o_outline.png');
        this.load.image('o_hat', 'assets/images/S2/o_hat.png');
        this.load.image('o_body', 'assets/images/S2/o_body.png');

        // --- 2. LOAD ẢNH CÔ GIÁO (MỚI) ---
        // Hãy đảm bảo tên file trong thư mục assets khớp với tên ở đây
        this.load.image('co_outline', 'assets/images/S2/teacher.png'); // image_12.png
        this.load.image('co_face', 'assets/images/S2/face.png');       // image_7.png
        this.load.image('co_hair', 'assets/images/S2/hair.png');       // image_9.png
        this.load.image('co_shirt', 'assets/images/S2/body.png');     // image_8.png
        this.load.image('co_hands', 'assets/images/S2/hand.png');     // image_10.png
        this.load.image('co_book', 'assets/images/S2/book.png');       // image_11.png

        // Load banner, board
        this.load.image('board_s2', 'assets/images/bg/board_scene_2.png');
        this.load.image('banner_s2', 'assets/images/S2/banner.png');
        this.load.image('text_banner_s2', 'assets/images/S2/text_banner.png');

        // Tạo đầu cọ vẽ
        const size = 150;
        const canvas = this.textures.createCanvas('brush_circle', size, size);
        if (canvas) {
            const ctx = canvas.context;
            const grd = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
            grd.addColorStop(0, 'rgba(255, 0, 0, 1)');
            grd.addColorStop(1, 'rgba(255, 0, 0, 0)');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, size, size);
            canvas.refresh();
        }
    }

    create() {
        resetVoiceState(); 
        setGameSceneReference(this);
        this.creatBroadAndBanner();

        const centerY = this.pctY(0.48); // Dịch xuống một chút cho cân

        // --- TẠO CÔ GIÁO (Bên Trái - 35% màn hình) ---
        this.createCharacter(this.pctX(0.37), centerY, TEACHER_CONFIG);

        // --- TẠO CHỮ Ô (Bên Phải - 75% màn hình) ---
        this.createCharacter(this.pctX(0.7), centerY, LETTER_CONFIG);

        // Xử lý sự kiện vẽ
        this.setupInput();
    }

    private creatBroadAndBanner() {
        const bannerS2 = this.add.image(
            this.pctX(0.5), 
            this.pctY(0.01), 
            'banner_s2'
        ).setOrigin(0.5,0).setScale(0.7);
        
        const textBannerS2 = this.add.image(
            this.pctX(0.5), 
            this.pctY(0.03), 
            'text_banner_s2'
        ).setOrigin(0.5,0).setScale(0.7);

        // Code tạo bảng và banner của bạn (nếu có)
        const boardS2 =  this.add.image(
            this.pctX(0.5), 
            bannerS2.displayHeight + this.pctY(0.03),
            'board_s2'
        ).setOrigin(0.5,0).setScale(0.7);
    }

    // --- HÀM TẠO NHÂN VẬT CHUNG (Đã sửa đổi từ createLetterO) ---
    // Hàm này giờ nhận vào một Config để biết cần tạo ai (Ô hay Cô giáo)
    private createCharacter(centerX: number, centerY: number, config: any) {
        // Bước 1: Tạo các phần tô màu từ danh sách trong config
        config.parts.forEach((part: any) => {
            const x = centerX + part.offsetX;
            const y = centerY + part.offsetY;
            
            // Dùng scale riêng của từng bộ phận (để tràn viền)
            this.createPaintablePart(x, y, part.key, part.scale);
        });

        // Bước 2: Đặt Viền Đen lên trên cùng
        const outline = this.add.image(centerX, centerY, config.outlineKey);
        outline.setScale(config.baseScale); // Viền dùng scale chuẩn
        outline.setDepth(100); 
        outline.setInteractive({ pixelPerfect: true }); 
    }

    // --- LOGIC TẠO LỚP VẼ (GIỮ NGUYÊN) ---
    private createPaintablePart(x: number, y: number, key: string, scale: number) {
        // A. Mask
        const maskImage = this.make.image({ x, y, key: key, add: false });
        maskImage.setScale(scale);
        const mask = maskImage.createBitmapMask();

        // B. Render Texture
        const rtW = maskImage.width * scale;
        const rtH = maskImage.height * scale;
        
        const rt = this.add.renderTexture(x - rtW/2, y - rtH/2, rtW, rtH);
        rt.setOrigin(0, 0); 
        rt.setMask(mask); 
        rt.setDepth(10);  

        // C. Hit Area
        const hitArea = this.add.image(x, y, key).setScale(scale);
        hitArea.setAlpha(0.01); // Tàng hình
        hitArea.setDepth(50); 
        
        hitArea.setInteractive({ useHandCursor: true, pixelPerfect: true });

        hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.activeRenderTexture = rt;
            this.paint(pointer, rt);
        });
    }

    // --- LOGIC VẼ (GIỮ NGUYÊN) ---
    private paint(pointer: Phaser.Input.Pointer, rt: Phaser.GameObjects.RenderTexture) {
        const localX = pointer.x - rt.x;
        const localY = pointer.y - rt.y;

        // Trừ 32 để vẽ đúng tâm cọ
        rt.draw(this.brushTexture, localX - 32, localY - 32, 1.0, this.brushColor);
    }

    private setupInput() {
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.isDown && this.activeRenderTexture) {
                this.paint(pointer, this.activeRenderTexture);
            }
        });

        this.input.on('pointerup', () => {
            this.activeRenderTexture = null;
        });
    }
}