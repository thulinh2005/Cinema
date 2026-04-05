USE rapchieuphim;

DELIMITER //

DROP TRIGGER IF EXISTS after_invoice_insert //
CREATE TRIGGER after_invoice_insert
AFTER INSERT ON hoa_don
FOR EACH ROW
BEGIN
    DECLARE points_earned INT;
    IF NEW.ma_kh IS NOT NULL THEN
        SET points_earned = FLOOR(NEW.tong_tien * 0.05);
        IF points_earned > 0 THEN
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

DROP TRIGGER IF EXISTS after_invoice_update //
CREATE TRIGGER after_invoice_update
AFTER UPDATE ON hoa_don
FOR EACH ROW
BEGIN
    DECLARE old_points INT;
    DECLARE new_points INT;

    SET old_points = FLOOR(OLD.tong_tien * 0.05);
    SET new_points = FLOOR(NEW.tong_tien * 0.05);

    -- Trường hợp 1: Cùng khách hàng
    IF OLD.ma_kh = NEW.ma_kh AND OLD.ma_kh IS NOT NULL THEN
        IF old_points != new_points THEN
            UPDATE khach_hang
            SET 
                diem_tich_luy = GREATEST(0, diem_tich_luy - old_points + new_points),
                hang_thanh_vien = CASE
                    WHEN GREATEST(0, diem_tich_luy - old_points + new_points) >= 5000 THEN 'SVIP'
                    WHEN GREATEST(0, diem_tich_luy - old_points + new_points) >= 1000 THEN 'VIP'
                    ELSE 'Standard'
                END
            WHERE ma_kh = NEW.ma_kh;
        END IF;
    -- Trường hợp 2: Đổi sang khách hàng khác
    ELSEIF OLD.ma_kh != NEW.ma_kh OR (OLD.ma_kh IS NULL AND NEW.ma_kh IS NOT NULL) OR (NEW.ma_kh IS NULL AND OLD.ma_kh IS NOT NULL) THEN
        -- Trừ điểm của khách cũ (nếu có)
        IF OLD.ma_kh IS NOT NULL THEN
            UPDATE khach_hang
            SET 
                diem_tich_luy = GREATEST(0, diem_tich_luy - old_points),
                hang_thanh_vien = CASE
                    WHEN GREATEST(0, diem_tich_luy - old_points) >= 5000 THEN 'SVIP'
                    WHEN GREATEST(0, diem_tich_luy - old_points) >= 1000 THEN 'VIP'
                    ELSE 'Standard'
                END
            WHERE ma_kh = OLD.ma_kh;
        END IF;

        -- Cộng điểm cho khách mới (nếu có)
        IF NEW.ma_kh IS NOT NULL THEN
            UPDATE khach_hang
            SET 
                diem_tich_luy = GREATEST(0, diem_tich_luy + new_points),
                hang_thanh_vien = CASE
                    WHEN GREATEST(0, diem_tich_luy + new_points) >= 5000 THEN 'SVIP'
                    WHEN GREATEST(0, diem_tich_luy + new_points) >= 1000 THEN 'VIP'
                    ELSE 'Standard'
                END
            WHERE ma_kh = NEW.ma_kh;
        END IF;
    END IF;
END //

DROP TRIGGER IF EXISTS after_invoice_delete //
CREATE TRIGGER after_invoice_delete
AFTER DELETE ON hoa_don
FOR EACH ROW
BEGIN
    DECLARE old_points INT;
    IF OLD.ma_kh IS NOT NULL THEN
        SET old_points = FLOOR(OLD.tong_tien * 0.05);
        UPDATE khach_hang
        SET 
            diem_tich_luy = GREATEST(0, diem_tich_luy - old_points),
            hang_thanh_vien = CASE
                WHEN GREATEST(0, diem_tich_luy - old_points) >= 5000 THEN 'SVIP'
                WHEN GREATEST(0, diem_tich_luy - old_points) >= 1000 THEN 'VIP'
                ELSE 'Standard'
            END
        WHERE ma_kh = OLD.ma_kh;
    END IF;
END //

DELIMITER ;
