-- Создание тестовых параметров для конфигуратора
-- Сначала создаем шаблоны параметров

-- Параметры для размеров
INSERT INTO "ParameterTemplate" (id, name, nameIt, type, description, unit, isGlobal, isActive, minValue, maxValue, step, createdAt, updatedAt, createdBy, approvalStatus) VALUES
('param_width', 'Ширина', 'Larghezza', 'NUMBER', 'Ширина изделия', 'см', true, true, 50, 300, 1, NOW(), NOW(), 'admin', 'approved'),
('param_height', 'Высота', 'Altezza', 'NUMBER', 'Высота изделия', 'см', true, true, 50, 300, 1, NOW(), NOW(), 'admin', 'approved'),
('param_thickness', 'Толщина', 'Spessore', 'NUMBER', 'Толщина рамы', 'мм', true, true, 40, 120, 5, NOW(), NOW(), 'admin', 'approved');

-- Параметры для материалов
INSERT INTO "ParameterTemplate" (id, name, nameIt, type, description, isGlobal, isActive, createdAt, updatedAt, createdBy, approvalStatus) VALUES
('param_material', 'Материал', 'Materiale', 'SELECT', 'Материал рамы', true, true, NOW(), NOW(), 'admin', 'approved'),
('param_color', 'Цвет', 'Colore', 'COLOR', 'Цвет изделия', true, true, NOW(), NOW(), 'admin', 'approved'),
('param_texture', 'Текстура', 'Texture', 'SELECT', 'Текстура материала', true, true, NOW(), NOW(), 'admin', 'approved');

-- Параметры для функциональности
INSERT INTO "ParameterTemplate" (id, name, nameIt, type, description, isGlobal, isActive, createdAt, updatedAt, createdBy, approvalStatus) VALUES
('param_opening', 'Тип открытия', 'Tipo apertura', 'SELECT', 'Способ открытия', true, true, NOW(), NOW(), 'admin', 'approved'),
('param_glass', 'Стекло', 'Vetro', 'BOOLEAN', 'Наличие стекла', true, true, NOW(), NOW(), 'admin', 'approved'),
('param_installation', 'Установка', 'Installazione', 'BOOLEAN', 'Включена ли установка', true, true, NOW(), NOW(), 'admin', 'approved');

-- Создаем значения для SELECT параметров
INSERT INTO "ParameterValue" (id, parameterId, value, valueIt, displayName, order, isActive, createdAt, updatedAt, createdBy, approvalStatus) VALUES
-- Материалы
('val_wood', 'param_material', 'Дерево', 'Legno', 'Дерево', 1, true, NOW(), NOW(), 'admin', 'approved'),
('val_aluminum', 'param_material', 'Алюминий', 'Alluminio', 'Алюминий', 2, true, NOW(), NOW(), 'admin', 'approved'),
('val_pvc', 'param_material', 'ПВХ', 'PVC', 'ПВХ', 3, true, NOW(), NOW(), 'admin', 'approved'),
('val_steel', 'param_material', 'Сталь', 'Acciaio', 'Сталь', 4, true, NOW(), NOW(), 'admin', 'approved'),

-- Цвета
('val_white', 'param_color', '#FFFFFF', '#FFFFFF', 'Белый', 1, true, NOW(), NOW(), 'admin', 'approved'),
('val_brown', 'param_color', '#8B4513', '#8B4513', 'Коричневый', 2, true, NOW(), NOW(), 'admin', 'approved'),
('val_black', 'param_color', '#000000', '#000000', 'Черный', 3, true, NOW(), NOW(), 'admin', 'approved'),
('val_gray', 'param_color', '#808080', '#808080', 'Серый', 4, true, NOW(), NOW(), 'admin', 'approved'),

-- Текстуры
('val_smooth', 'param_texture', 'Гладкая', 'Liscia', 'Гладкая', 1, true, NOW(), NOW(), 'admin', 'approved'),
('val_rough', 'param_texture', 'Шероховатая', 'Ruvida', 'Шероховатая', 2, true, NOW(), NOW(), 'admin', 'approved'),
('val_wood_grain', 'param_texture', 'Древесная текстура', 'Venatura legno', 'Древесная текстура', 3, true, NOW(), NOW(), 'admin', 'approved'),

-- Типы открытия
('val_swing', 'param_opening', 'Поворотное', 'A battente', 'Поворотное', 1, true, NOW(), NOW(), 'admin', 'approved'),
('param_sliding', 'param_opening', 'Раздвижное', 'A scorrimento', 'Раздвижное', 2, true, NOW(), NOW(), 'admin', 'approved'),
('val_tilt_turn', 'param_opening', 'Поворотно-откидное', 'A ribalta', 'Поворотно-откидное', 3, true, NOW(), NOW(), 'admin', 'approved');

-- Создаем связи параметров с категориями (берем первую категорию)
-- Сначала найдем ID первой категории
-- Предполагаем что у нас есть категория с ID 'cat_doors' или 'cat_windows'

-- Для примера создаем связи с категорией дверей (если она существует)
INSERT INTO "CategoryParameter" (id, categoryId, parameterId, isRequired, isVisible, "order", displayName, displayNameIt, defaultValue, helpText, createdAt, updatedAt) VALUES
-- Размеры (обязательные)
('cp_width', 'cat_doors', 'param_width', true, true, 1, 'Ширина', 'Larghezza', '80', 'Ширина двери в сантиметрах', NOW(), NOW()),
('cp_height', 'cat_doors', 'param_height', true, true, 2, 'Высота', 'Altezza', '200', 'Высота двери в сантиметрах', NOW(), NOW()),
('cp_thickness', 'cat_doors', 'param_thickness', true, true, 3, 'Толщина', 'Spessore', '50', 'Толщина рамы в миллиметрах', NOW(), NOW()),

-- Материалы (обязательные)
('cp_material', 'cat_doors', 'param_material', true, true, 4, 'Материал', 'Materiale', 'Дерево', 'Материал рамы двери', NOW(), NOW()),
('cp_color', 'cat_doors', 'param_color', true, true, 5, 'Цвет', 'Colore', '#8B4513', 'Цвет двери', NOW(), NOW()),

-- Функциональность (опциональные)
('cp_opening', 'cat_doors', 'param_opening', false, true, 6, 'Тип открытия', 'Tipo apertura', 'Поворотное', 'Способ открытия двери', NOW(), NOW()),
('cp_glass', 'cat_doors', 'param_glass', false, true, 7, 'Стекло', 'Vetro', 'false', 'Наличие стекла в двери', NOW(), NOW()),
('cp_installation', 'cat_doors', 'param_installation', false, true, 8, 'Установка', 'Installazione', 'false', 'Включена ли установка', NOW(), NOW());
