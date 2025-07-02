use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    name: String,
    path: String,
    is_dir: bool,
    size: u64,
    modified: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DirectoryContents {
    files: Vec<FileInfo>,
    path: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn list_directory(path: String) -> Result<DirectoryContents, String> {
    let path = Path::new(&path);
    
    if !path.exists() {
        return Err("Path does not exist".to_string());
    }

    if !path.is_dir() {
        return Err("Path is not a directory".to_string());
    }

    let mut files = Vec::new();
    
    match fs::read_dir(path) {
        Ok(entries) => {
            for entry in entries {
                match entry {
                    Ok(entry) => {
                        let path = entry.path();
                        let metadata = entry.metadata().map_err(|e| e.to_string())?;
                        
                        let file_info = FileInfo {
                            name: path.file_name()
                                .unwrap_or_default()
                                .to_string_lossy()
                                .to_string(),
                            path: path.to_string_lossy().to_string(),
                            is_dir: metadata.is_dir(),
                            size: metadata.len(),
                            modified: format!("{:?}", metadata.modified().unwrap_or(std::time::SystemTime::UNIX_EPOCH)),
                        };
                        
                        files.push(file_info);
                    },
                    Err(e) => return Err(e.to_string()),
                }
            }
        },
        Err(e) => return Err(e.to_string()),
    }

    // Sort: directories first, then files, alphabetically
    files.sort_by(|a, b| {
        match (a.is_dir, b.is_dir) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });

    Ok(DirectoryContents {
        files,
        path: path.to_string_lossy().to_string(),
    })
}

#[tauri::command]
async fn create_directory(path: String) -> Result<(), String> {
    fs::create_dir_all(&path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_file(path: String) -> Result<(), String> {
    let path = Path::new(&path);
    
    if path.is_dir() {
        fs::remove_dir_all(&path).map_err(|e| e.to_string())
    } else {
        fs::remove_file(&path).map_err(|e| e.to_string())
    }
}

#[tauri::command]
async fn copy_file(source_path: String, dest_path: String) -> Result<(), String> {
    fs::copy(&source_path, &dest_path)
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn move_file(source_path: String, dest_path: String) -> Result<(), String> {
    fs::rename(&source_path, &dest_path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn rename_file(path: String, new_name: String) -> Result<(), String> {
    let old_path = Path::new(&path);
    let parent = old_path.parent().ok_or("Cannot get parent directory")?;
    let new_path = parent.join(&new_name);
    
    fs::rename(&old_path, &new_path).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            list_directory,
            create_directory,
            delete_file,
            copy_file,
            move_file,
            rename_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
