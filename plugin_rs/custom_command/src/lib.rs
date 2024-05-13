use napi_derive::napi;
use std::process::Command;

#[napi]
pub fn modify_with_command(
    shell: String,
    args: Vec<String>,
    command_str: String,
    text: String,
) -> Result<String, napi::Error> {
    let mut command = Command::new(shell);
    command.args(args).arg(format!("{} {}", command_str, text));
    let output = command.output().map_err(napi::Error::from)?;

    if output.status.success() {
        let output_string = String::from_utf8_lossy(&output.stdout).to_string();
        Ok(output_string)
    } else {
        let error_string = String::from_utf8_lossy(&output.stderr).to_string();
        Err(napi::Error::new(napi::Status::GenericFailure, error_string))
    }
}
