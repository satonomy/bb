pub fn generate_png(index: u128) -> Result<Vec<u8>> {
    let (background, back, body, head, hat, hand) = Self::decode_traits(index)?;

    let mut base_image: RgbaImage = ImageBuffer::new(420, 420);

    for pixel in base_image.pixels_mut() {
        *pixel = Rgba([0, 0, 0, 0]); // transparent
    }

    // 加载背景图片
    if background != "None" {
        let bg_image_path = format!("Background/{}.png", background);
        if let Some(file) = TRAITS_DIR.get_file(&bg_image_path) {
            let bg_img = image::load_from_memory(file.contents())?;
            let bg_rgba = bg_img.to_rgba8();
            imageops::overlay(&mut base_image, &bg_rgba, 0, 0);
        }
    }

    let traits = [
        ("Back", &back),
        ("Body", &body),
        ("Head", &head),
        ("Hat", &hat),
        ("Hand", &hand),
    ];

    for (layer, trait_value) in traits.iter() {
        if trait_value != &"None" {
            let image_path = format!("{}/{}.png", layer, trait_value);
            if let Some(file) = TRAITS_DIR.get_file(&image_path) {
                let trait_img = image::load_from_memory(file.contents())?;
                let trait_rgba = trait_img.to_rgba8();
                imageops::overlay(&mut base_image, &trait_rgba, 0, 0);
            } else {
                return Err(anyhow!("Trait image not found: {}", image_path));
            }
        }
    }

    let dynamic_img = DynamicImage::ImageRgba8(base_image);
    let mut buf = Vec::new();
    dynamic_img.write_to(&mut std::io::Cursor::new(&mut buf), image::ImageFormat::Png)?;
    Ok(buf)
}

fn hex_to_bytes(hex_str: &str) -> Result<Vec<u8>> {
    let hex_str = hex_str.trim_start_matches("0x");
    let hex_str = hex_str.trim_start_matches('b');

    match hex::decode(hex_str) {
        Ok(bytes) => Ok(bytes),
        Err(e) => Err(anyhow!("Failed to decode hex string: {}", e)),
    }
} 