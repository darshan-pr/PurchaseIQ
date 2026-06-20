package com.example.notes;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/datasets")
public class DatasetController {
    private final DatasetService datasetService;

    public DatasetController(DatasetService datasetService) {
        this.datasetService = datasetService;
    }

    @PostMapping("/upload")
    @ResponseStatus(HttpStatus.CREATED)
    public DatasetUploadResponse upload(@RequestPart("file") MultipartFile file) {
        return datasetService.upload(file);
    }

    @GetMapping
    public List<DatasetSummary> list() {
        return datasetService.listDatasets();
    }

    @GetMapping("/active")
    public DatasetSummary active() {
        return datasetService.getActiveDataset();
    }

    @GetMapping("/{id}")
    public DatasetDetail details(@PathVariable Long id) {
        return datasetService.getDataset(id);
    }

    @PutMapping("/{id}/activate")
    public DatasetSummary activate(@PathVariable Long id) {
        return datasetService.activateDataset(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        datasetService.deleteDataset(id);
    }
}
