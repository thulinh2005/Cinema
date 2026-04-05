USE rapchieuphim;

DELIMITER //

DROP TRIGGER IF EXISTS after_invoice_insert //

CREATE TRIGGER after_invoice_insert
AFTER INSERT ON hoa_don
FOR EACH ROW
BEGIN
    DECLARE points_earned INT;
    
    IF NEW.ma_kh IS NOT NULL THEN
        -- Tính điểm 5% từ tổng tiền hóa đơn
        SET points_earned = FLOOR(NEW.tong_tien * 0.05);
        
        IF points_earned > 0 THEN
            -- Cập nhật điểm tích lũy và điều chỉnh lại hạng
            UPDATE khach_hang
            SET 
                diem_tich_luy = diem_tich_luy + points_earned,
                hang_thanh_vien = CASE
                    WHEN (diem_tich_luy + points_earned) >= 5000 THEN 'SVIP'
                    WHEN (diem_tich_luy + points_earned) >= 1000 THEN 'VIP'
                    ELSE 'Standard'
                END
            WHERE ma_kh = NEW.ma_kh;
        END IF;
    END IF;
END //

DELIMITER ;
