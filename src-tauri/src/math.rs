#[tauri::command]
pub fn submit(name: &str) -> String {
    format!("{} wassup, How you dey na?", name)
}

#[tauri::command]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}
