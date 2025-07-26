    import { PartialType } from '@nestjs/mapped-types';
    import { CertificateDto } from './createTankCertificate.dto';

export class UpdateCertificateDto extends PartialType(CertificateDto) {}
