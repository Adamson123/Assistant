use screenshots::Screen;
use base64::{engine::general_purpose, Engine as _};
use tauri::Window;

#[tauri::command]
pub fn take_screenshot(window: Window) -> String {
    // Hide window (so it doesn't appear in screenshot)
    //window.hide().unwrap();

    //std::thread::sleep(std::time::Duration::from_millis(200));

    let screens = Screen::all().unwrap();
    let image = screens[0].capture().unwrap();

    //window.show().unwrap();

    // Convert to PNG bytes (IMPORTANT)
    let mut bytes: Vec<u8> = Vec::new();
    image
        .write_to(
            &mut std::io::Cursor::new(&mut bytes),
            image::ImageOutputFormat::Png,
        )
        .unwrap();

    // Encode to base64
    general_purpose::STANDARD.encode(bytes)
}