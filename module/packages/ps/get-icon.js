module.exports = `
Function Get-Icon {
   
    [cmdletbinding(
        DefaultParameterSetName = '__DefaultParameterSetName'
    )]
    Param (
        [parameter(ValueFromPipelineByPropertyName=$True)]
        [ValidateNotNullorEmpty()]
        [string]$Path,
        [parameter(ParameterSetName = 'Bytes')]
        [switch]$ToBytes,
        [parameter(ParameterSetName = 'Bitmap')]
        [switch]$ToBitmap,
        [parameter(ParameterSetName = 'Base64')]
        [switch]$ToBase64
    )
    Begin {
        If ($PSBoundParameters.ContainsKey('Debug')) {
            $DebugPreference = 'Continue'
        }
        Add-Type -AssemblyName System.Drawing
    }
    Process {
        $Path = Convert-Path -Path $Path
        Write-Debug $Path
        If (Test-Path -Path $Path) {
            $Icon = [System.Drawing.Icon]::ExtractAssociatedIcon($Path)| 
            Add-Member -MemberType NoteProperty -Name FullName -Value $Path -PassThru
            If ($PSBoundParameters.ContainsKey('ToBytes')) {
                Write-Verbose "Retrieving bytes"
                $MemoryStream = New-Object System.IO.MemoryStream
                $Icon.save($MemoryStream)
                Write-Debug ($MemoryStream | Out-String)
                $MemoryStream.ToArray()   
                $MemoryStream.Flush()  
                $MemoryStream.Dispose()           
            } ElseIf ($PSBoundParameters.ContainsKey('ToBitmap')) {
                $Icon.ToBitMap()
            } ElseIf ($PSBoundParameters.ContainsKey('ToBase64')) {
                $MemoryStream = New-Object System.IO.MemoryStream
                $Icon.save($MemoryStream)
                Write-Debug ($MemoryStream | Out-String)
                $Bytes = $MemoryStream.ToArray()   
                $MemoryStream.Flush() 
                $MemoryStream.Dispose()
                [convert]::ToBase64String($Bytes)
            }  Else {
                $Icon
            }
        } Else {
            Write-Warning "$Path does not exist!"
            Continue
        }
    }
}
`